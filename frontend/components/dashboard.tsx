// === DASHBOARD COMPONENT ===
// This component serves as the main user interface for interacting with various services
// It includes theme switching, service management, notifications, and more

"use client"

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Responsive, WidthProvider } from 'react-grid-layout';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button } from "@/components/ui/button";
import { Bell, Circle, LogOut } from "lucide-react";
import type { Layout, Layouts } from "react-grid-layout";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import ReactDOM from "react-dom";
import { Download, Send } from "lucide-react";
import { CalendarWidget } from "@/components/calendar-widget";

interface Widget {
  id: string;
  label: string;
}

// Available widgets that can be added to the dashboard
const AVAILABLE_WIDGETS: Widget[] = [
  { id: "welcome", label: "Welcome" },
  { id: "notifications", label: "Notifications" },
  { id: "services", label: "Services" },
  { id: "assistant", label: "Assistant" },
];

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600); // default fallback
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Function to fetch user-specific grid layout
    const fetchUserLayout = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${backendUrl}/dashboard/layout`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.layout && Array.isArray(data.layout) && data.layout.length > 0) {
            setWidgets(data.layout);
          } else {
            // No saved layout, use default
            setWidgets(defaultLayout);
          }
        } else {
          // Error fetching layout, use default
          setWidgets(defaultLayout);
        }
      } catch (error) {
        console.error('Failed to fetch user layout:', error);
        // Error occurred, use default
        setWidgets(defaultLayout);
      } finally {
        setLayoutLoaded(true);
      }
    };
    fetchUserLayout();
  }, []);

  const onLayoutChange = (layout: Layout[]) => {
    if (!layoutLoaded) return; // Don't save if layout hasn't been loaded yet
    
    setWidgets(layout);
    // Save layout to backend
    const saveUserLayout = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/dashboard/layout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ layout })
        });
        if (!response.ok) {
          console.error('Failed to save layout:', response.status);
        }
      } catch (error) {
        console.error('Failed to save user layout:', error);
      }
    };
    saveUserLayout();
  };

  useEffect(() => {
    function updateWidth() {
      if (gridContainerRef.current) {
        setContainerWidth(gridContainerRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    // Fetch dashboard data from backend
    const fetchDashboard = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${backendUrl}/dashboard`, { credentials: 'include' });
        if (!res.ok) throw new Error('Not authenticated');
        const data = await res.json();
        setDashboardData(data);
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to load dashboard', variant: 'destructive' });
      }
    };
    fetchDashboard();
  }, [toast]);

  // Default layout: 2x2 grid, widgets can be resized and moved
  const defaultLayout: Layout[] = [
    { i: "welcome", x: 0, y: 0, w: 3, h: 2 }, // greetings/calendar - made wider
    { i: "services", x: 3, y: 0, w: 2, h: 1 }, // services
    { i: "notifications", x: 0, y: 2, w: 2, h: 2 }, // notifications
    { i: "assistant", x: 3, y: 1, w: 2, h: 3 }, // chatbot
  ];
  
  // Initialize with empty array to prevent null reference errors
  const [widgets, setWidgets] = useState<Layout[]>([]);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(["welcome", "notifications", "services", "assistant"]);

  // Remove handleRemoveWidget and handleAddWidget logic if not used elsewhere

  const handleLogout = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      // Call backend logout endpoint
      await fetch(`${backendUrl}/auth/logout`, { 
        credentials: 'include',
        redirect: 'manual'
      });
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to home
      router.push('/');
    }
  };

  // Assistant widget hooks and handlers (moved from switch)
  const [chatInput, setChatInput] = React.useState("");
  const [chatMessages, setChatMessages] = React.useState([
    { sender: "bot", text: "Hi! How can I help you today?" }
  ]);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const chatAreaRef = React.useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleScroll = () => {
    if (!chatAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatAreaRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(msgs => [
      ...msgs,
      { sender: "user", text: chatInput }
    ]);
    setChatInput("");
    // Simulate bot reply
    setTimeout(() => {
      setChatMessages(msgs => [
        ...msgs,
        { sender: "bot", text: "(This is a demo bot reply.)" }
      ]);
    }, 600);
  };

  // In Dashboard component, add state for userServices and modal
  const [userServices, setUserServices] = useState([
    { id: 'google', name: 'Google', icon: '/google.svg', url: 'https://myaccount.google.com/' }
  ]);
  const [showAddService, setShowAddService] = useState(false);
  const placeholderServices = [
    { id: 'github', name: 'GitHub', icon: '/github.svg', connection: 'github' },
    { id: 'microsoft', name: 'Microsoft', icon: '/microsoft.svg', connection: 'microsoft' },
    { id: 'gmail', name: 'Gmail', icon: '/gmail.svg', connection: 'google-oauth2' },
    { id: 'g_calendar', name: 'Google Calendar', icon: '/g_calendar.svg', connection: 'google-oauth2' },
    { id: 'notion', name: 'Notion', icon: '/notion.svg', connection: 'notion' }
  ];
  const handleAddService = (service: any) => {
    setShowAddService(false);
    // Redirect to backend OAuth endpoint for the selected service
    window.location.href = `/api/auth/login?connection=${service.connection}`;
  };
  const availableToAdd = placeholderServices.filter(s => !userServices.some(us => us.id === s.id));

  // In Dashboard component, add state for expanded assistant and chat sessions
  const [assistantExpanded, setAssistantExpanded] = useState(false);
  const [chatSessions, setChatSessions] = useState([
    { id: 1, name: "Chat 1", messages: chatMessages }
  ]);
  const [activeSession, setActiveSession] = useState(1);
  const assistantLongPressTimeout = useRef<NodeJS.Timeout | null>(null);

  // Long press handler for assistant
  const handleAssistantMouseDown = () => {
    if (assistantLongPressTimeout.current) clearTimeout(assistantLongPressTimeout.current);
    assistantLongPressTimeout.current = setTimeout(() => {
      setAssistantExpanded(true);
    }, 600);
  };
  const handleAssistantMouseUp = () => {
    if (assistantLongPressTimeout.current) clearTimeout(assistantLongPressTimeout.current);
  };
  // In Dashboard component, add state for animation
  const [chatboxRect, setChatboxRect] = useState<{top: number, left: number, width: number, height: number} | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const chatboxRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Handlers for animation
  const handleAssistantExpand = () => {
    if (chatboxRef.current) {
      const rect = chatboxRef.current.getBoundingClientRect();
      setChatboxRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
      setAssistantExpanded(true);
      setTimeout(() => setIsAnimating(true), 10);
    }
  };
  const handleAssistantShrink = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setAssistantExpanded(false);
      setChatboxRect(null);
    }, 400);
  };
  const handleDismissAssistant = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === "assistant-overlay") {
      handleAssistantShrink();
    }
  };
  // Download chat as text
  const handleDownloadChat = () => {
    const session = chatSessions.find(s => s.id === activeSession);
    if (!session) return;
    const text = session.messages.map(m => `${m.sender}: ${m.text}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  // Add new chat session
  const handleNewChat = () => {
    const newId = chatSessions.length ? Math.max(...chatSessions.map(s => s.id)) + 1 : 1;
    setChatSessions([...chatSessions, { id: newId, name: `Chat ${newId}`, messages: [] }]);
    setActiveSession(newId);
  };
  // Switch chat session
  const handleSwitchSession = (id: number) => {
    setActiveSession(id);
  };

  // In Dashboard component, add state for edit mode
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#181818]">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
        {/* === DASHBOARD HEADER === */}
        <div className="dashboard-header flex justify-between items-center mb-10">
          {/* === LEFT SIDE: LOGO AND TITLE === */}
          <div className="header-left-section flex items-center space-x-4">
            {/* === LOGO ICON === */}
            <div className="dashboard-logo-wrapper w-10 h-10 bg-black dark:bg-white rounded-2xl flex items-center justify-center">
              <Circle className="dashboard-logo-icon h-5 w-5 fill-white dark:fill-black text-white dark:text-black" />
            </div>
            {/* === TITLE AND SUBTITLE === */}
            <div className="header-title-section">
              <h1 className="dashboard-title text-2xl font-semibold">Hub</h1>
              <p className="dashboard-subtitle text-sm text-gray-500">Your workspace</p>
            </div>
          </div>
          {/* === RIGHT SIDE: CONTROLS AND PROFILE === */}
          <div className="header-right-section flex items-center space-x-3">
            {/* === LOGOUT BUTTON === */}
            <Button
              variant="ghost"
              size="icon"
              className="logout-button rounded-2xl"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="logout-icon h-4 w-4" />
            </Button>
            {/* === THEME TOGGLE BUTTON === */}
            <Button
              variant="ghost"
              size="icon"
              className="theme-toggle-button rounded-2xl"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {mounted ? (
                theme === "dark" ? <Moon className="theme-moon-icon h-4 w-4" /> : <Sun className="theme-sun-icon h-4 w-4" />
              ) : (
                <div className="h-4 w-4" />
              )}
            </Button>
            {/* === EDIT LAYOUT BUTTON === */}
            <Button
              variant={editMode ? "default" : "outline"}
              size="sm"
              className="edit-layout-toggle ml-2"
              onClick={() => setEditMode(e => !e)}
            >
              {editMode ? "Done" : "Edit Layout"}
            </Button>
            {/* === PROFILE AVATAR === */}
            <Link href="/profile" className="profile-avatar-link">
              <Avatar className="profile-avatar w-9 h-9">
                <AvatarImage 
                  src={dashboardData?.user?.picture || "/placeholder.svg?height=36&width=36"} 
                  className="profile-avatar-image" 
                />
                <AvatarFallback className="profile-avatar-fallback">
                  {dashboardData?.user?.firstName?.charAt(0) || dashboardData?.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
          {/* === END DASHBOARD HEADER === */}
          {/* Add Widget Buttons */}
          {/* Remove the Add Widget Buttons section */}
          <div className="relative" ref={gridContainerRef} style={{ width: '60vw', minWidth: 320, margin: '0 auto' }}>
             <div ref={gridRef} style={{position: 'relative', width: '100%', height: '100%'}}>
            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: widgets }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 5, md: 4, sm: 3, xs: 2, xxs: 1 }}
              rowHeight={120}
              width={containerWidth}
              onLayoutChange={() => {}} // No-op, don't save on every change
              onDragStop={(layout: any, oldItem: any, newItem: any, placeholder: any, e: any, element: any) => onLayoutChange(layout)}
              isResizable={editMode}
              isDraggable={editMode}
              draggableCancel=".widget-content,button,a,input,select,textarea"
              resizeHandles={editMode ? ['s', 'e', 'n', 'w', 'se', 'sw', 'ne', 'nw'] : undefined}
              isDroppable={editMode}
              allowOverlap={editMode}
              margin={[16, 16]}
              containerPadding={[0, 0]}
              preventCollision={true}
            >
{widgets && widgets.length > 0 && widgets.map(w => (
                <div key={w.i} className="rounded-2xl bg-white dark:bg-neutral-900 shadow p-4 relative flex flex-col overflow-hidden">
                  {/* Remove the remove button from each widget */}
                  <div className="flex-1 flex flex-col items-left justify-center relative">
                    {/* Conditional rendering for dashboard widgets */}
                    {(() => {
                      switch (w.i) {
                        case "welcome":
                          return <CalendarWidget dashboardData={dashboardData} />;
                        case "notifications":
                          return (
                            <div>Notifications will be displayed here.</div>
                          );
                        case "services":
                          return (
                            <div className="flex flex-row items-center h-full gap-4">
                              {userServices.map(service => (
                                <a
                                  key={service.id}
                                  href={service.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block rounded-2xl shadow-lg w-24 h-24 flex items-center justify-center bg-white dark:bg-neutral-900 hover:shadow-xl transition ml-0"
                                  title={service.name}
                                >
                                  <img
                                    src={service.icon}
                                    alt={service.name}
                                    className="w-20 h-20 object-contain"
                                  />
                                </a>
                              ))}
                              {/* Add Service Button */}
                              <button
                                className="inline-block rounded-2xl shadow-lg w-24 h-24 flex items-center justify-center bg-white dark:bg-neutral-900 hover:shadow-xl transition ml-0 border-2 border-dashed border-gray-300 dark:border-neutral-700 text-3xl text-gray-400 hover:text-primary"
                                onClick={() => setShowAddService(true)}
                                title="Add Service"
                              >
                                +
                              </button>
                              {/* Modal/Dropdown for adding service */}
                              {showAddService && ReactDOM.createPortal(
                                <>
                                  <div
                                    className="fixed inset-0 z-[9998] bg-black/30 dark:bg-black/50"
                                    onClick={() => setShowAddService(false)}
                                    aria-label="Close modal backdrop"
                                  />
                                  <div className="fixed z-[9999] bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-neutral-800 mt-2 left-1/2 -translate-x-1/2 top-1/4">
                                    <div className="mb-2 text-sm font-semibold">Add a Service</div>
                                    <div className="flex gap-4">
                                      {availableToAdd.map(service => (
                                        <button
                                          key={service.id}
                                          className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg"
                                          onClick={() => handleAddService(service)}
                                        >
                                          <img src={service.icon} alt={service.name} className="w-10 h-10 mb-1" />
                                          <span className="text-xs text-gray-700 dark:text-gray-200">{service.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                    <button className="mt-3 text-xs text-gray-500 hover:text-primary" onClick={() => setShowAddService(false)}>Cancel</button>
                                  </div>
                                </>,
                                document.body
                              )}
                            </div>
                          );
                        case "assistant":
                          return (
                            <div
                              className={"h-full w-full transition-all duration-500 " + (assistantExpanded ? "z-[9999]" : "")}
                              style={{ position: "relative", display: "flex", flexDirection: "column" }}
                              onMouseDown={assistantExpanded ? undefined : (e) => {
                                assistantLongPressTimeout.current = setTimeout(handleAssistantExpand, 600);
                              }}
                              onMouseUp={assistantExpanded ? undefined : () => {
                                if (assistantLongPressTimeout.current) clearTimeout(assistantLongPressTimeout.current);
                              }}
                              onMouseLeave={assistantExpanded ? undefined : () => {
                                if (assistantLongPressTimeout.current) clearTimeout(assistantLongPressTimeout.current);
                              }}
                              onTouchStart={assistantExpanded ? undefined : (e) => {
                                assistantLongPressTimeout.current = setTimeout(handleAssistantExpand, 600);
                              }}
                              onTouchEnd={assistantExpanded ? undefined : () => {
                                if (assistantLongPressTimeout.current) clearTimeout(assistantLongPressTimeout.current);
                              }}
                            >
                              {/* Overlay and expanded chat with grow animation */}
                              {assistantExpanded && chatboxRect && (() => {
                                const grid = gridRef.current?.getBoundingClientRect();
                                const vw = window.innerWidth;
                                const vh = window.innerHeight;
                                const expandedWidth = Math.min(vw * 0.98, 1200);
                                const expandedHeight = Math.min(vh * 0.90, 800);
                                // Always center in the viewport
                                const targetWidth = expandedWidth;
                                const targetHeight = expandedHeight;
                                let targetLeft = Math.max(0, (vw - targetWidth) / 2);
                                let targetTop = Math.max(0, (vh - targetHeight) / 2);
                                return ReactDOM.createPortal(
                                  <>
                                    <div
                                      id="assistant-overlay"
                                      className="fixed inset-0 z-[9998] bg-black/60 transition-opacity duration-700"
                                      style={{
                                        opacity: isAnimating ? 1 : 0,
                                        pointerEvents: isAnimating ? 'auto' : 'none',
                                      }}
                                      onClick={handleDismissAssistant}
                                    ></div>
                                    <div
                                      className="fixed z-[9999] flex transition-all rounded-3xl shadow-2xl bg-white dark:bg-neutral-900"
                                      style={{
                                        top: isAnimating ? targetTop : chatboxRect.top,
                                        left: isAnimating ? targetLeft : chatboxRect.left,
                                        width: isAnimating ? targetWidth : chatboxRect.width,
                                        height: isAnimating ? targetHeight : chatboxRect.height,
                                        minWidth: 320,
                                        minHeight: 400,
                                        maxWidth: '98vw',
                                        maxHeight: '90vh',
                                        display: 'flex',
                                        alignItems: 'stretch',
                                        overflow: 'hidden',
                                        transition: 'all 0.7s cubic-bezier(.4,0,.2,1)',
                                        fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
                                      }}
                                      onClick={e => e.stopPropagation()}
                                    >
                                        {/* Left panel for chat sessions (20% width) */}
                                        <div className="h-full p-4 flex flex-col border-r border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 rounded-l-2xl" style={{ width: '20%' }}>
                                          <div className="font-semibold mb-2">Chats</div>
                                          <div className="flex-1 overflow-y-auto space-y-2">
                                            {chatSessions.map(session => (
                                              <button
                                                key={session.id}
                                                className={`w-full text-left px-3 py-2 rounded-lg transition font-medium ${activeSession === session.id ? "bg-primary text-primary-foreground" : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200"}`}
                                                onClick={() => handleSwitchSession(session.id)}
                                              >
                                                {session.name}
                                              </button>
                                            ))}
                                          </div>
                                          <button
                                            className="mt-4 w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
                                            onClick={handleNewChat}
                                          >
                                            + New Chat
                                          </button>
                                        </div>
                                        {/* Main chat area (80% width) */}
                                        <div className="flex-1 flex flex-col h-full" style={{ width: '80%', fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`, minHeight: 0 }}>
                                          <div
                                            ref={chatAreaRef}
                                            onScroll={handleScroll}
                                            className="flex-1 overflow-y-auto px-8 py-8 space-y-5 bg-muted rounded-r-3xl"
                                            style={{ minHeight: 0, maxHeight: '100%', position: 'relative' }}
                                          >
                                            {(chatSessions.find(s => s.id === activeSession)?.messages || []).map((msg, idx) => (
                                              <div
                                                key={idx}
                                                className={msg.sender === "user" ? "text-right" : "text-left"}
                                              >
                                                <span
                                                  className={
                                                    "inline-block px-4 py-2 rounded-2xl text-base " +
                                                    (msg.sender === "user"
                                                      ? "bg-primary text-primary-foreground"
                                                      : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-neutral-700")
                                                  }
                                                >
                                                  {msg.text}
                                                </span>
                                              </div>
                                            ))}
                                            <div ref={chatEndRef} />
                                          </div>
                                          <form
                                            onSubmit={handleSend}
                                            className="flex items-center gap-2 border-t border-gray-200 dark:border-neutral-800 bg-background rounded-b-2xl"
                                            style={{ position: "relative", zIndex: 10, height: '15%' }}
                                          >
                                            <input
                                              type="text"
                                              value={chatInput}
                                              onChange={e => setChatInput(e.target.value)}
                                              placeholder="Type your message..."
                                              className="flex-1 rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-2 text-base bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                              style={{ minWidth: 0 }}
                                            />
                                            <button
                                              type="submit"
                                              className="rounded-full p-2 bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center justify-center"
                                              title="Send"
                                            >
                                              <Send size={20} />
                                            </button>
                                            <button
                                              type="button"
                                              className="rounded-full p-2 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-600 transition flex items-center justify-center"
                                              onClick={handleDownloadChat}
                                              title="Download chat"
                                            >
                                              <Download size={20} />
                                            </button>
                                          </form>
                                        </div>
                                      </div>
                                    </>
                                  , document.body);
                              })()}
                              {/* Normal chatbox (not expanded) */}
                              {!assistantExpanded && (
                        <div ref={chatboxRef} className="h-full w-full flex flex-col" style={{ position: 'absolute', inset: 0 }}>
                          <div
                            ref={chatAreaRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto px-2 py-2 space-y-2 bg-muted rounded-t-md"
                            style={{ minHeight: 0, maxHeight: 'calc(100% - 50px)' }}
                          >
                                    {chatMessages.map((msg, idx) => (
                                      <div
                                        key={idx}
                                        className={
                                          msg.sender === "user"
                                            ? "text-right"
                                            : "text-left"
                                        }
                                      >
                                        <span
                                          className={
                                            "inline-block px-3 py-1 rounded-2xl text-sm max-w-[80%] break-words " +
                                            (msg.sender === "user"
                                              ? "bg-primary text-primary-foreground"
                                              : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-neutral-700")
                                          }
                                        >
                                          {msg.text}
                                        </span>
                                      </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                  </div>
                                  <form
                                    onSubmit={handleSend}
                                    className="flex items-center gap-1 p-2 border-t border-gray-200 dark:border-neutral-800 bg-background rounded-b-md"
                                    style={{ flexShrink: 0 }}
                                  >
                                    <input
                                      type="text"
                                      value={chatInput}
                                      onChange={e => setChatInput(e.target.value)}
                                      placeholder="Type your message..."
                                      className="flex-1 rounded-full border border-gray-300 dark:border-neutral-700 px-2 py-1 text-sm bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                      style={{ minWidth: 0 }}
                                    />
                                    <button
                                      type="submit"
                                      className="rounded-full p-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center justify-center flex-shrink-0"
                                      title="Send"
                                    >
                                      <Send size={16} />
                                    </button>
                                  </form>
                                </div>
                              )}
                            </div>
                          );
                        default:
                          return <div>Unknown Widget</div>;
                      }
                    })()}
                  </div>
                </div>
              ))}
            </ResponsiveGridLayout>
          </div>
          </div>
                </div>
              </div>
      {/* === LANDING PAGE FOOTER AT BOTTOM === */}
      <footer className="landing-footer py-3 border-t border-gray-200 dark:border-gray-800">
        <div className="footer-content-container max-w-xl mx-auto px-6">
          {/* === FOOTER MAIN CONTENT === */}
          <div className="footer-main-content flex flex-col  items-center">
            {/* === FOOTER NAVIGATION === */}
            <div className="footer-nav-links flex text-sm text-gray-500">
              <Link href="#" className="footer-link contact-link hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="footer-copyright text-center text-xs text-gray-400 mt-2">
            © 2025 Hub. All rights reserved.
          </div>
      </div>
      </footer>
      <style jsx global>{`
@keyframes growChat {
  0% { transform: scale(0.7); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}
`}</style>
    </div>
  );
}

