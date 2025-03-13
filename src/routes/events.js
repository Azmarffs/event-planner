const express = require('express');
const router = express.Router();
const { parseISO, addMinutes, isPast } = require('date-fns');
const events = require('../data/events');

// Create event
router.post('/', (req, res) => {
  const { name, description, date, time, category, reminder } = req.body;
  const userId = req.user.id;

  const event = {
    id: events.length + 1,
    userId,
    name,
    description,
    datetime: new Date(`${date}T${time}`),
    category,
    reminder: parseInt(reminder), // minutes before event
    created: new Date()
  };

  events.push(event);
  res.status(201).json(event);
});

// Get all events for user
router.get('/', (req, res) => {
  const userId = req.user.id;
  const { sort, category } = req.query;

  let userEvents = events.filter(event => event.userId === userId);

  if (category) {
    userEvents = userEvents.filter(event => event.category === category);
  }

  switch (sort) {
    case 'date':
      userEvents.sort((a, b) => a.datetime - b.datetime);
      break;
    case 'category':
      userEvents.sort((a, b) => a.category.localeCompare(b.category));
      break;
    case 'reminder':
      userEvents.sort((a, b) => a.reminder - b.reminder);
      break;
  }

  res.json(userEvents);
});

// Get upcoming reminders
router.get('/reminders', (req, res) => {
  const userId = req.user.id;
  const now = new Date();

  const upcomingReminders = events
    .filter(event => {
      if (event.userId !== userId) return false;
      
      const reminderTime = addMinutes(event.datetime, -event.reminder);
      return !isPast(reminderTime);
    })
    .map(event => ({
      ...event,
      reminderTime: addMinutes(event.datetime, -event.reminder)
    }))
    .sort((a, b) => a.reminderTime - b.reminderTime);

  res.json(upcomingReminders);
});

// Update event
router.put('/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const userId = req.user.id;
  const eventIndex = events.findIndex(e => e.id === eventId && e.userId === userId);

  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const { name, description, date, time, category, reminder } = req.body;
  
  events[eventIndex] = {
    ...events[eventIndex],
    name,
    description,
    datetime: new Date(`${date}T${time}`),
    category,
    reminder: parseInt(reminder)
  };

  res.json(events[eventIndex]);
});

// Delete event
router.delete('/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const userId = req.user.id;
  const eventIndex = events.findIndex(e => e.id === eventId && e.userId === userId);

  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  events.splice(eventIndex, 1);
  res.status(204).send();
});

module.exports = router;