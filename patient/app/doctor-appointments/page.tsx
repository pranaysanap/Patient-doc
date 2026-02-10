"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, MapPin, Star, Phone, Mail, Video, User, MessageSquare, Filter, Search } from "lucide-react";
import { doctorConfig } from "@/lib/doctor-config";
import { Sidebar } from "@/components/layout/sidebar";

export default function DoctorAppointmentsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<string>("in-person");

  // Single doctor availability (mock data based on doctorConfig)
  const availability = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "06:00 PM"];

  const upcomingAppointments = [
    {
      id: "apt-1",
      doctor: doctorConfig.name,
      specialty: doctorConfig.specialty,
      date: "May 15, 2025",
      time: "10:30 AM",
      type: "In-person",
      location: doctorConfig.location
    }
  ];

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleBookAppointment = () => {
    // In a real app, this would send the appointment data to a backend
    alert(`Appointment booked with ${doctorConfig.name} on ${format(date!, 'PPP')} at ${selectedTimeSlot}`);

    // Reset selection
    setSelectedTimeSlot(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
            <p className="text-muted-foreground mb-8">
              Schedule your visit with Dr. Sujal
            </p>
          </motion.div>

          <Tabs defaultValue="schedule">
            <TabsList className="mb-8">
              <TabsTrigger value="schedule">Schedule Appointment</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
              <TabsTrigger value="history">Appointment History</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Doctor Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={doctorConfig.avatar} alt={doctorConfig.name} />
                          <AvatarFallback>DS</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">{doctorConfig.name}</h3>
                          <p className="text-muted-foreground">{doctorConfig.role} - {doctorConfig.specialty}</p>
                          <p className="text-sm">{doctorConfig.description}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {doctorConfig.location}</div>
                            <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {doctorConfig.availableHours}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Select Time Slot</CardTitle>
                      <CardDescription>Available slots for {date ? format(date, 'PPP') : 'selected date'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {availability.map((time) => (
                          <Badge
                            key={time}
                            variant={selectedTimeSlot === time ? "default" : "outline"}
                            className="cursor-pointer text-sm py-2 px-4"
                            onClick={() => handleTimeSlotSelect(time)}
                          >
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Appointment Details</CardTitle>
                      <CardDescription>
                        Select date and appointment type
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md border"
                          disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Appointment Type</Label>
                        <Select value={appointmentType} onValueChange={setAppointmentType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select appointment type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in-person">In-Person Visit</SelectItem>
                            <SelectItem value="video">Video Consultation</SelectItem>
                            <SelectItem value="phone">Phone Consultation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Reason for Visit</Label>
                        <Textarea placeholder="Briefly describe your symptoms or reason for the appointment" />
                      </div>

                      <Button
                        className="w-full mt-4"
                        disabled={!selectedTimeSlot || !date}
                        onClick={handleBookAppointment}
                      >
                        Confirm Appointment
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upcoming">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Upcoming Appointments</h2>

                {upcomingAppointments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingAppointments.map((appointment) => (
                      <Card key={appointment.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium">{appointment.doctor}</h3>
                              <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                            </div>
                            <Badge variant={appointment.type === "Video Call" ? "outline" : "default"}>
                              {appointment.type}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{appointment.time}</span>
                            </div>
                            {appointment.location && (
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{appointment.location}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 mt-6">
                            {appointment.type === "Video Call" ? (
                              <Button className="flex-1">
                                <Video className="h-4 w-4 mr-2" />
                                Join Video Call
                              </Button>
                            ) : (
                              <Button className="flex-1">
                                <MapPin className="h-4 w-4 mr-2" />
                                Get Directions
                              </Button>
                            )}
                            <Button variant="outline" className="flex-1">
                              Reschedule
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground mb-4">You don't have any upcoming appointments</p>
                      <Button>Schedule an Appointment</Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Appointment History</h2>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="border-b pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{doctorConfig.name}</h3>
                            <p className="text-sm text-muted-foreground">{doctorConfig.specialty}</p>
                          </div>
                          <Badge variant="outline">Completed</Badge>
                        </div>
                        <div className="flex items-center text-sm mb-1">
                          <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>February 15, 2025</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>10:30 AM</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            <User className="h-4 w-4 mr-2" />
                            View Summary
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message Doctor
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}