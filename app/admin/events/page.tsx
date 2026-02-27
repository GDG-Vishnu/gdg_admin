"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetch("/api/admin/events")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  return (
    <div className="flex flex-col">
      <PageHeader title="Events" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Event Management
          </h2>
          <p className="text-muted-foreground">
            Organize and manage GDG community events.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          {events.length === 0 ? (
            <Card className="flex items-center justify-center p-12 bg-muted/20 border-dashed">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-xl font-medium text-muted-foreground">No events found.</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Check back later or create a new event.</p>
              </div>
            </Card>
          ) : (
            events.map((event: any) => (
              <Link key={event.id} href={`/admin/events/${event.id}`}>
                <Card
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-none bg-gradient-to-r from-white to-slate-50/50 shadow-md cursor-pointer"
                >
                <div className="flex flex-col md:flex-row min-h-[160px]">
                  {/* Left Section: Image/Visual */}
                  <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-blue-500/40" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        event.status === 'upcoming' ? 'bg-green-500 text-white' : 
                        event.status === 'ongoing' ? 'bg-blue-500 text-white' : 
                        'bg-slate-500 text-white'
                      }`}>
                        {event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || 'Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Right Section: Details */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </CardTitle>
                        <div className="flex items-center text-slate-500 font-medium">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm">
                            {event.Date
                              ? new Date(event.Date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                              : "Date TBD"}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 mt-auto">
                      {event.venue && (
                        <div className="flex items-center text-sm text-slate-500">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span>{event.venue}</span>
                        </div>
                      )}
                      {event.organizer && (
                        <div className="flex items-center text-sm text-slate-500">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span>Managed by {event.organizer}</span>
                        </div>
                      )}
                      
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex gap-2 ml-auto">
                          {event.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
          )}
        </div>
      </div>
    </div>
  );
}
