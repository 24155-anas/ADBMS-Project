-- Trigger: Auto Update Vehicle Availability for RENTALS
CREATE OR REPLACE FUNCTION fn_rental_vehicle_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- If rental is marked 'active' (car picked up), mark vehicle as unavailable
    IF NEW.status = 'active' THEN
        UPDATE vehicles SET is_available = FALSE WHERE vehicle_id = NEW.vehicle_id;
    -- If rental is marked 'completed' (car returned) or 'cancelled', mark vehicle as available
    ELSIF NEW.status IN ('completed', 'cancelled') THEN
        UPDATE vehicles SET is_available = TRUE WHERE vehicle_id = NEW.vehicle_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rental_vehicle_availability ON rental_bookings;
CREATE TRIGGER trg_rental_vehicle_availability
AFTER UPDATE OF status ON rental_bookings
FOR EACH ROW
EXECUTE FUNCTION fn_rental_vehicle_availability();


-- Trigger: Auto Complete Payment when Rental is Completed
CREATE OR REPLACE FUNCTION fn_rental_payment_auto_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE rental_payments 
        SET payment_status = 'completed', 
            payment_time = CURRENT_TIMESTAMP
        WHERE rental_id = NEW.rental_id AND payment_status = 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rental_payment_auto_complete ON rental_bookings;
CREATE TRIGGER trg_rental_payment_auto_complete
AFTER UPDATE OF status ON rental_bookings
FOR EACH ROW
EXECUTE FUNCTION fn_rental_payment_auto_complete();
