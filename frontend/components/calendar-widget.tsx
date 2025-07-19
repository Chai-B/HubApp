"use client"

import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Event {
  title: string;
  date: string;
  time: string;
}

interface CalendarWidgetProps {
  dashboardData: any;
}

export function CalendarWidget({ dashboardData }: CalendarWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const handleLongPress = useRef<NodeJS.Timeout | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [isMounted, setIsMounted] = React.useState(false);
  const today = new Date();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [animRect, setAnimRect] = useState<{top: number, left: number, width: number, height: number} | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isShort, setIsShort] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    // Load events from localStorage
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Save events to localStorage whenever they change
  React.useEffect(() => {
    if (isMounted) {
      localStorage.setItem('calendarEvents', JSON.stringify(events));
    }
  }, [events, isMounted]);

  // Height check for isShort
  useEffect(() => {
    function checkHeight() {
      if (widgetRef.current) {
        setIsShort(widgetRef.current.offsetHeight < 220);
      }
    }
    checkHeight();
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const todayFormatted = isMounted ? formatDate(today) : '';
  const selectedFormatted = isMounted && selectedDate ? formatDate(selectedDate) : '';

  // Helper to check if a date has events
  const hasEvent = (date: Date) => {
    const d = date.toISOString().slice(0, 10);
    return events.some(evt => evt.date === d);
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const d = date.toISOString().slice(0, 10);
    return events.filter(evt => evt.date === d);
  };

  // Remove event
  const removeEvent = (idx: number, date: string) => {
    setEvents(evts => evts.filter((evt, i) => !(i === idx && evt.date === date)));
  };

  // Add event
  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !selectedDate || !eventTime) return;
    setEvents(evts => [...evts, { 
      title: eventTitle, 
      date: selectedDate.toISOString().slice(0,10), 
      time: eventTime 
    }]);
    setEventTitle("");
    setEventTime("");
  };

  // Custom day renderer: only show days up to today if short
  const CustomDay = ({ date, ...props }: any) => {
    if (isShort) {
      const todayDate = new Date();
      todayDate.setHours(0,0,0,0);
      if (date > todayDate) {
        return <div className="w-9 h-9" />;
      }
    }
    return <button {...props} />;
  };

  // Animate grow/shrink like chatbot
  const handleExpand = () => {
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      setAnimRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      setExpanded(true);
      setTimeout(() => setIsAnimating(true), 10);
    }
  };
  const handleShrink = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setExpanded(false);
      setAnimRect(null);
    }, 400);
  };
  const handleOverlayClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === "calendar-overlay") handleShrink();
  };

  // Expanded overlay with animation
  if (expanded && typeof window !== 'undefined' && animRect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Match chatbox: up to 1200px or 98vw, and 800px or 90vh
    const expandedWidth = Math.min(vw * 0.98, 1200);
    const expandedHeight = Math.min(vh * 0.90, 800);
    const targetLeft = Math.max(0, (vw - expandedWidth) / 2);
    const targetTop = Math.max(0, (vh - expandedHeight) / 2);
    return ReactDOM.createPortal(
      <>
        <div
          id="calendar-overlay"
          className="fixed inset-0 z-[9998] bg-black/60 transition-opacity duration-700"
          style={{ opacity: isAnimating ? 1 : 0, pointerEvents: isAnimating ? 'auto' : 'none' }}
          onClick={handleOverlayClick}
        ></div>
        <div
          className="fixed z-[9999] flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl"
          style={{
            top: isAnimating ? targetTop : animRect.top,
            left: isAnimating ? targetLeft : animRect.left,
            width: isAnimating ? expandedWidth : animRect.width,
            height: isAnimating ? expandedHeight : animRect.height,
            minWidth: 320,
            minHeight: 400,
            maxWidth: '98vw',
            maxHeight: '90vh',
            transition: 'all 0.7s cubic-bezier(.4,0,.2,1)', // match chatbox
            overflow: 'hidden',
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={handleShrink} className="absolute top-4 right-4 text-gray-400 hover:text-primary text-2xl">×</button>
          <div className="flex flex-col items-center justify-center w-full h-full p-8">
            <h2 className="text-2xl font-bold mb-2 text-center">Welcome, {dashboardData?.user?.firstName || "User"}!</h2>
            <div className="mb-4 text-sm text-muted-foreground text-center">Selected Date: <span className="font-medium">{selectedFormatted}</span></div>
            <div className="flex flex-col items-center w-full h-full flex-1 justify-center">
              <div className="flex justify-center items-center w-full mb-4 relative flex-1">
                <div className="flex items-center justify-center w-full h-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border-0 w-full max-w-3xl min-h-[320px] max-h-[420px] aspect-[2.2/1] mx-auto flex items-center justify-center"
                  />
                </div>
              </div>
              <form onSubmit={addEvent} className="flex flex-col gap-2 mb-4 w-full max-w-lg mx-auto">
                <input type="text" value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Event/Reminder Title" className="rounded-md border px-3 py-2" />
                <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} className="rounded-md border px-3 py-2" />
                <button type="submit" className="rounded-md bg-primary text-primary-foreground px-4 py-2 mt-2">Add Event/Reminder</button>
              </form>
              <div className="flex-1 overflow-y-auto w-full max-w-lg mx-auto">
                <h3 className="font-semibold mb-2">Events/Reminders</h3>
                {getEventsForDate(selectedDate || new Date()).length === 0 && <div className="text-xs text-gray-400">No events for this date.</div>}
                <ul className="space-y-1">
                  {getEventsForDate(selectedDate || new Date()).map((evt, idx) => (
                    <li key={idx} className="rounded bg-gray-100 dark:bg-neutral-800 px-3 py-2 text-sm flex justify-between items-center">
                      <span>{evt.title} <span className="text-xs text-gray-500 ml-2">{evt.time}</span></span>
                      <button onClick={() => removeEvent(idx, evt.date)} className="ml-2 text-red-500 hover:text-red-700 text-lg">×</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  }

  return (
    <div
      ref={widgetRef}
      className="w-full h-full flex flex-col p-2 cursor-pointer"
      onMouseDown={() => (handleLongPress.current = setTimeout(handleExpand, 600))}
      onMouseUp={() => handleLongPress.current && clearTimeout(handleLongPress.current)}
      onMouseLeave={() => handleLongPress.current && clearTimeout(handleLongPress.current)}
      title="Long press to expand and add events/reminders"
    >
      {/* Header: greeting left, today's date right */}
      <div className="flex justify-between items-center mb-2 w-full">
        <h2 className="text-base font-semibold">Welcome, {dashboardData?.user?.firstName || "User"}! </h2>
        {isMounted && (
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{todayFormatted}</span>
        )}
      </div>
      {/* Calendar block, always below header */}
      <div className="flex flex-col min-h-[220px] w-full items-center justify-center p-0 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow font-sans text-gray-900 dark:text-gray-100">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rdp w-full p-0 rounded-md border-0 text-gray-900 dark:text-gray-100 !opacity-100 text-center font-sans"
          components={{ Day: CustomDay }}
        />
      </div>
    </div>
  );
}
