// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await event.getEventById(eventId);
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json(event);
    } catch (error) {
        console.error('Error in getEventById:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
};

// Update event
exports.updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const updateData = req.body;

        const success = await event.updateEvent(eventId, updateData);
        
        if (!success) {
            return res.status(404).json({ error: 'Event not found or could not be updated' });
        }

        res.json({ success: true, message: 'Event updated successfully' });
    } catch (error) {
        console.error('Error in updateEvent:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
};

// Delete event (soft delete)
exports.deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const success = await event.deleteEvent(eventId);
        
        if (!success) {
            return res.status(404).json({ error: 'Event not found or could not be deleted' });
        }

        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error in deleteEvent:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
}; 