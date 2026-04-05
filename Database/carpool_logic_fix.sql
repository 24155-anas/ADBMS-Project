-- SQL: Carpool Seat Management & Payment Logic
-- This file adds ACID triggers to handle carpool seat counts and payment completion.

-- 1. Function to update available seats on booking/cancellation
CREATE OR REPLACE FUNCTION fn_update_carpool_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Check if enough seats are available
        IF (SELECT available_seats FROM carpool_offers WHERE carpool_id = NEW.carpool_id) < NEW.seats_booked THEN
            RAISE EXCEPTION 'Not enough seats available in this carpool.';
        END IF;

        -- Deduct seats
        UPDATE carpool_offers
        SET available_seats = available_seats - NEW.seats_booked
        WHERE carpool_id = NEW.carpool_id;
        
        -- If seats reach 0, mark as full
        UPDATE carpool_offers
        SET status = 'full'
        WHERE carpool_id = NEW.carpool_id AND available_seats = 0;

    ELSIF (TG_OP = 'UPDATE') THEN
        -- If booking is cancelled, restore seats
        IF (OLD.status != 'cancelled' AND NEW.status = 'cancelled') THEN
            UPDATE carpool_offers
            SET available_seats = available_seats + NEW.seats_booked,
                status = 'open' -- Reopen if it was full
            WHERE carpool_id = NEW.carpool_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger for seat management
DROP TRIGGER IF EXISTS trg_update_carpool_seats ON carpool_bookings;
CREATE TRIGGER trg_update_carpool_seats
AFTER INSERT OR UPDATE ON carpool_bookings
FOR EACH ROW
EXECUTE FUNCTION fn_update_carpool_seats();

-- 3. Function to auto-complete carpool payments when trip is completed
CREATE OR REPLACE FUNCTION fn_carpool_complete_payments()
RETURNS TRIGGER AS $$
BEGIN
    -- When offer is marked 'completed'
    IF (OLD.status != 'completed' AND NEW.status = 'completed') THEN
        -- Mark all related bookings as completed
        UPDATE carpool_bookings
        SET status = 'completed'
        WHERE carpool_id = NEW.carpool_id AND status = 'confirmed';

        -- Mark all related payments as completed
        UPDATE carpool_payments
        SET payment_status = 'completed'
        WHERE carpool_booking_id IN (
            SELECT booking_id FROM carpool_bookings WHERE carpool_id = NEW.carpool_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger for payment auto-completion
DROP TRIGGER IF EXISTS trg_carpool_complete_payments ON carpool_offers;
CREATE TRIGGER trg_carpool_complete_payments
AFTER UPDATE ON carpool_offers
FOR EACH ROW
EXECUTE FUNCTION fn_carpool_complete_payments();
