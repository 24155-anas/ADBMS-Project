// Maps raw DB/server errors to user-friendly strings
const errorMap = [
    ['Not enough seats available', 'There are not enough seats available for this carpool.'],
    ['cannot create booking with past start date', 'The start date cannot be in the past.'],
    ['Cannot delete vehicle with active', 'This vehicle has active bookings and cannot be deleted.'],
    ['Vehicle is currently unavailable', 'Sorry, this vehicle is not available right now.'],
    ['vehicle already booked', 'This vehicle is already booked for the selected period.'],
    ['Ride request is no longer pending', 'This ride request has already been accepted or cancelled.'],
    ['No vehicles are currently available', 'There are no vehicles available at the moment. Please try again shortly.'],
    ['phone already in use', 'This phone number is already registered.'],
    ['email already exists', 'An account with this email already exists.'],
    ['Invalid credentials', 'Email or password is incorrect.'],
    ['Token expired', 'Your session has expired. Please sign in again.'],
    ['Access denied', 'You do not have permission to perform this action.'],
    ['Too many requests', 'Too many requests. Please wait a moment and try again.'],
];

export function mapError(raw = '') {
    const lower = raw.toLowerCase();
    for (const [key, friendly] of errorMap) {
        if (lower.includes(key.toLowerCase())) return friendly;
    }
    return raw || 'Something went wrong. Please try again.';
}
