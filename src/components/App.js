import React, { useState, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Popup from "react-popup";
import "./../styles/App.css";

const localizer = momentLocalizer(moment);

const App = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all"); // "all", "past", "upcoming"
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Filter events based on selected filter
  const filteredEvents = useMemo(() => {
    const now = moment().startOf("day");
    
    if (filter === "past") {
      return events.filter(event => moment(event.start).startOf("day").isBefore(now));
    } else if (filter === "upcoming") {
      return events.filter(event => moment(event.start).startOf("day").isSameOrAfter(now));
    }
    return events;
  }, [events, filter]);

  // Event style getter
  const eventStyleGetter = (event) => {
    const now = moment().startOf("day");
    const eventDate = moment(event.start).startOf("day");
    const isPast = eventDate.isBefore(now);
    
    let backgroundColor = isPast 
      ? "rgb(222, 105, 135)" // Pink for past events
      : "rgb(140, 189, 76)"; // Green for upcoming events

    return {
      style: {
        backgroundColor: backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block"
      }
    };
  };

  // Handle slot selection (creating new event)
  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });
    setSelectedEvent(null);
    
    // Check if there's an existing event on this date
    const existingEvent = events.find(event => 
      moment(event.start).startOf("day").isSame(moment(start).startOf("day"))
    );

    if (existingEvent) {
      // Show edit/delete popup
      setSelectedEvent(existingEvent);
      showEditDeletePopup(existingEvent);
    } else {
      // Show create event popup
      showCreateEventPopup(start);
    }
  };

  // Handle event click
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    showEditDeletePopup(event);
  };

  // Show create event popup
  const showCreateEventPopup = (startDate) => {
    Popup.create({
      title: "Create Event",
      content: (
        <div className="event-form">
          <input
            type="text"
            placeholder="Event Title"
            id="event-title-input"
            className="event-input"
          />
          <input
            type="text"
            placeholder="Event Location"
            id="event-location-input"
            className="event-input"
          />
        </div>
      ),
      buttons: {
        right: [
          {
            text: "Save",
            className: "mm-popup__btn mm-popup__btn--success",
            action: function () {
              const titleInput = document.getElementById("event-title-input");
              const locationInput = document.getElementById("event-location-input");
              const title = titleInput ? titleInput.value : "";
              const location = locationInput ? locationInput.value : "";

              if (title.trim()) {
                const newEvent = {
                  id: Date.now(),
                  title: title,
                  location: location,
                  start: moment(startDate).toDate(),
                  end: moment(startDate).add(1, "hour").toDate()
                };
                setEvents([...events, newEvent]);
                Popup.close();
              }
            }
          },
          {
            text: "Cancel",
            className: "mm-popup__btn mm-popup__btn--cancel",
            action: function () {
              Popup.close();
            }
          }
        ]
      }
    });
  };

  // Show edit/delete popup
  const showEditDeletePopup = (event) => {
    Popup.create({
      title: "Event Details",
      content: (
        <div className="event-form">
          <input
            type="text"
            placeholder="Event Title"
            id="edit-event-title-input"
            className="event-input"
            defaultValue={event.title}
          />
          <input
            type="text"
            placeholder="Event Location"
            id="edit-event-location-input"
            className="event-input"
            defaultValue={event.location || ""}
          />
        </div>
      ),
      buttons: {
        right: [
          {
            text: "Edit",
            className: "mm-popup__btn mm-popup__btn--info",
            action: function () {
              const titleInput = document.getElementById("edit-event-title-input");
              const locationInput = document.getElementById("edit-event-location-input");
              const title = titleInput ? titleInput.value : "";
              const location = locationInput ? locationInput.value : "";

              if (title.trim()) {
                setEvents(events.map(e =>
                  e.id === event.id
                    ? { ...e, title: title, location: location }
                    : e
                ));
                Popup.close();
              }
            }
          },
          {
            text: "Delete",
            className: "mm-popup__btn mm-popup__btn--danger",
            action: function () {
              setEvents(events.filter(e => e.id !== event.id));
              Popup.close();
            }
          },
          {
            text: "Cancel",
            className: "mm-popup__btn mm-popup__btn--cancel",
            action: function () {
              Popup.close();
            }
          }
        ]
      }
    });
  };

  return (
    <div className="app-container">
      {/* Do not remove the main div */}
      <div className="calendar-header">
        <h1>Event Tracker</h1>
        <div className="filter-buttons">
          <button
            className="btn"
            onClick={() => setFilter("all")}
            style={{
              backgroundColor: filter === "all" ? "#007bff" : "#f0f0f0",
              color: filter === "all" ? "white" : "black"
            }}
          >
            All
          </button>
          <button
            className="btn"
            onClick={() => setFilter("past")}
            style={{
              backgroundColor: filter === "past" ? "#007bff" : "#f0f0f0",
              color: filter === "past" ? "white" : "black"
            }}
          >
            Past
          </button>
          <button
            className="btn"
            onClick={() => setFilter("upcoming")}
            style={{
              backgroundColor: filter === "upcoming" ? "#007bff" : "#f0f0f0",
              color: filter === "upcoming" ? "white" : "black"
            }}
          >
            Upcoming
          </button>
        </div>
      </div>

      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          eventPropGetter={eventStyleGetter}
        />
      </div>

      <Popup />
    </div>
  );
};

export default App;
