// Game Event Management Routes
router.get('/game-event/:id', auth.user, c_event.getEventById);
router.put('/game-event/:id', auth.user, c_event.updateEvent);
router.put('/game-event/:id/delete', auth.user, c_event.deleteEvent); 