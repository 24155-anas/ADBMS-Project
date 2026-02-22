DROP VIEW  IF EXISTS vw_vehicle_review_stats CASCADE;
DROP VIEW  IF EXISTS vw_driver_earnings CASCADE;
DROP VIEW  IF EXISTS vw_active_rentals CASCADE;

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS carpool_bookings CASCADE;
DROP TABLE IF EXISTS carpool_offers CASCADE;
DROP TABLE IF EXISTS ride_bookings CASCADE;
DROP TABLE IF EXISTS rental_bookings CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;



--Making Tables

--roles
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE CHECK (role_name IN ('customer', 'driver', 'admin'))
);


--users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    profile_pic VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

--user roles
CREATE TABLE user_roles (
    user_role_id  SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, role_id) --composite unique constraint taake user ko same role 2 bar assign na ho
);


--vehicles
CREATE TABLE vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    licence_plate VARCHAR(20) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    seats INTEGER NOT NULL CHECK (seats > 0),
    hourly_rate NUMERIC(10,2) NOT NULL CHECK (hourly_rate >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('Sedan', 'SUV', 'Bike', 'Van'))
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--rental bookings
CREATE TABLE rental_bookings (
    rental_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    
    CHECK (end_date >= start_date)
);


--ride bookings 
CREATE TABLE ride_bookings (
    ride_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    driver_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    pickup_time TIMESTAMP , --i changed this, pickup time can be null
    dropoff_time TIMESTAMP,
    fare NUMERIC(10,2) NOT NULL CHECK (fare >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--carpool offers
CREATE TABLE carpool_offers (
    carpool_id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
    price_per_seat NUMERIC(10,2) NOT NULL CHECK (price_per_seat >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'completed', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--carpool bookings
CREATE TABLE carpool_bookings (
    booking_id SERIAL PRIMARY KEY,
    carpool_id INTEGER NOT NULL REFERENCES carpool_offers(carpool_id) ON DELETE CASCADE,
    passenger_id INTEGER NOT NULL REFERENCES users(user_id)            ON DELETE CASCADE,
    seats_booked INTEGER     NOT NULL CHECK (seats_booked > 0),
    booking_time TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (carpool_id, passenger_id)--passenger cant book same carpool twice
);


--to be changed
--payments
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    booking_type VARCHAR(20) NOT NULL CHECK (booking_type IN ('rental', 'ride', 'carpool')),
    booking_id INTEGER NOT NULL, --FK(rental_id/ride_id/carpool booking_id)
    amount NUMERIC(10,2)  NOT NULL CHECK (amount >= 0),
    payment_method  VARCHAR(10)    NOT NULL
        CHECK (payment_method IN ('card', 'cash')),
    payment_time    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status          VARCHAR(20)    NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

--reviews table
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    reviewer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reviewee_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
    booking_type VARCHAR(20) NOT NULL CHECK (booking_type IN ('rental', 'ride', 'carpool')),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);



--INDEXES
-- users
CREATE INDEX users_email_search_index ON users (email);
CREATE INDEX users_active_status_index ON users (is_active);
--user roles
CREATE INDEX user_roles_lookup_by_user_index ON user_roles (user_id);
CREATE INDEX user_roles_lookup_by_role_index ON user_roles (role_id);
--vehicles
CREATE INDEX vehicles_availability_status_index ON vehicles (is_available);
--rental bookings
CREATE INDEX rentals_customer_history_index ON rental_bookings (customer_id);
CREATE INDEX rentals_vehicle_history_index ON rental_bookings (vehicle_id);
CREATE INDEX rentals_status_filter_index ON rental_bookings (status);
CREATE INDEX rentals_date_range_lookup_index ON rental_bookings (start_date, end_date);
--ride bookings
CREATE INDEX rides_customer_history_index ON ride_bookings (customer_id);
CREATE INDEX rides_driver_history_index ON ride_bookings (driver_id);
CREATE INDEX rides_vehicle_history_index ON ride_bookings (vehicle_id);
CREATE INDEX rides_status_filter_index ON ride_bookings (status);
--carpool offers
CREATE INDEX carpools_driver_offers_index ON carpool_offers (driver_id);
CREATE INDEX carpools_vehicle_offers_index ON carpool_offers (vehicle_id);
CREATE INDEX carpools_status_filter_index ON carpool_offers (status);
--carpool bookings
CREATE INDEX carpool_bookings_offer_lookup_index ON carpool_bookings (carpool_id);
CREATE INDEX carpool_bookings_passenger_lookup_index ON carpool_bookings (passenger_id);
--payments
CREATE INDEX payments_user_history_index ON payments (user_id);
CREATE INDEX payments_booking_reference_index ON payments (booking_type, booking_id);
--reviews
CREATE INDEX reviews_from_reviewer_index ON reviews (reviewer_id);
CREATE INDEX reviews_to_reviewee_index ON reviews (reviewee_id);
CREATE INDEX reviews_vehicle_feedback_index ON reviews (vehicle_id);


--TRIGGERS
--Trigger 1: Preventing Negative Carpool seats
CREATE OR REPLACE FUNCTION fn_check_carpool_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT available_seats FROM carpool_offers WHERE carpool_id = NEW.carpool_id) < NEW.seats_booked THEN
        RAISE EXCEPTION 'Not enough seats available in this carpool offer.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_carpool_seats
BEFORE INSERT ON carpool_bookings
FOR EACH ROW
EXECUTE FUNCTION fn_check_carpool_seats();

-- Trigger 2: Auto Update Vehicle Availability
CREATE OR REPLACE FUNCTION fn_rental_vehicle_availability()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        UPDATE vehicles SET is_available = FALSE WHERE vehicle_id = NEW.vehicle_id;
    ELSIF NEW.status IN ('completed', 'cancelled') THEN
        UPDATE vehicles SET is_available = TRUE WHERE vehicle_id = NEW.vehicle_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rental_vehicle_availability
AFTER INSERT OR UPDATE OF status ON rental_bookings
FOR EACH ROW
EXECUTE FUNCTION fn_rental_vehicle_availability();

-- Trigger 3: Auto complete carpools when full
CREATE OR REPLACE FUNCTION fn_carpool_seats_update()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE carpool_offers
        SET available_seats = available_seats - NEW.seats_booked
        WHERE carpool_id = NEW.carpool_id;

        UPDATE carpool_offers
        SET status = 'full'
        WHERE carpool_id = NEW.carpool_id AND available_seats <= 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_carpool_seats_update
AFTER INSERT ON carpool_bookings
FOR EACH ROW
EXECUTE FUNCTION fn_carpool_seats_update();

-- Trigger 4: Prevent Users from booking past date rentals
CREATE OR REPLACE FUNCTION fn_check_rental_start_date()
RETURNS TRIGGER AS $$
BEGIN
    --idhr current date se kam ni hoskta
    IF NEW.start_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'cannot create booking with past start date.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_rental_start_date
BEFORE INSERT ON rental_bookings
FOR EACH ROW
EXECUTE FUNCTION fn_check_rental_start_date();

-- Trigger 5: Admin cannot delete a Vehicle with active bookings
CREATE OR REPLACE FUNCTION fn_check_vehicle_before_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM rental_bookings
        WHERE vehicle_id = OLD.vehicle_id AND status IN ('active', 'pending')
    ) OR EXISTS (
        SELECT 1 FROM ride_bookings
        WHERE vehicle_id = OLD.vehicle_id AND status IN ('active', 'pending')
    ) OR EXISTS (
        SELECT 1 FROM carpool_offers
        WHERE vehicle_id = OLD.vehicle_id AND status IN ('open', 'full')
    ) THEN
        RAISE EXCEPTION 'Cannot delete vehicle with active or pending bookings.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_vehicle_before_delete
BEFORE DELETE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION fn_check_vehicle_before_delete();



--VIEWS

-- View 1: Active Rentals Summary
CREATE VIEW vw_active_rentals AS
SELECT
    rb.rental_id,
    u.full_name AS customer_name,
    u.email AS customer_email,
    v.model AS vehicle_model,
    v.licence_plate,
    rb.start_date,
    rb.end_date,
    rb.total_amount,
    rb.status
FROM rental_bookings rb
JOIN users u ON rb.customer_id = u.user_id
JOIN vehicles v ON rb.vehicle_id  = v.vehicle_id
WHERE rb.status = 'active';


-- View 2: Driver Earnings (total from rides + carpools)
CREATE VIEW vw_driver_earnings AS
SELECT
    u.user_id AS driver_id,
    u.full_name AS driver_name,
    COALESCE(ride_totals.ride_earnings, 0) AS ride_earnings,
    COALESCE(carpool_totals.carpool_earnings, 0) AS carpool_earnings,
    COALESCE(ride_totals.ride_earnings, 0) + COALESCE(carpool_totals.carpool_earnings, 0) AS total_earnings
FROM users u
LEFT JOIN (
    SELECT driver_id, SUM(fare) AS ride_earnings
    FROM ride_bookings
    WHERE status = 'completed'
    GROUP BY driver_id
) ride_totals ON u.user_id = ride_totals.driver_id
LEFT JOIN (
    SELECT co.driver_id, SUM(cb.seats_booked * co.price_per_seat) AS carpool_earnings
    FROM carpool_offers co
    JOIN carpool_bookings cb ON co.carpool_id = cb.carpool_id
    WHERE cb.status = 'completed'
    GROUP BY co.driver_id
) carpool_totals ON u.user_id = carpool_totals.driver_id
WHERE EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = u.user_id AND r.role_name = 'driver'
);


-- View 3: Vehicle Review Statistics
CREATE VIEW vw_vehicle_review_stats AS
SELECT
    v.vehicle_id,
    v.model,
    v.licence_plate,
    COUNT(r.review_id) AS total_reviews,
    ROUND(AVG(r.rating), 2) AS avg_rating,
    MIN(r.rating) AS min_rating,
    MAX(r.rating) AS max_rating
FROM vehicles v
LEFT JOIN reviews r ON v.vehicle_id = r.vehicle_id
GROUP BY v.vehicle_id, v.model, v.licence_plate;