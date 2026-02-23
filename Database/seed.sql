
INSERT INTO roles (role_name) VALUES
('customer'),
('driver'),
('admin');

INSERT INTO users (email, password_hash, phone, full_name, profile_pic, is_active) VALUES
('ahmed.khan@gmail.com', '$2b$12$abcdefghij1234567890AB', '+923001234501', 'Ahmed Khan',        'https://example.com/pics/ahmed.jpg',    TRUE),
('sara.ahmed@gmail.com', '$2b$12$abcdefghij1234567890AC', '+923001234502', 'Sara Ahmed',        'https://example.com/pics/sara.jpg',     TRUE),
('bilal.hassan@yahoo.com', '$2b$12$abcdefghij1234567890AD', '+923001234503', 'Bilal Hassan',      'https://example.com/pics/bilal.jpg',    TRUE),
('fatima.zahra@hotmail.com', '$2b$12$abcdefghij1234567890AE', '+923001234504', 'Fatima Zahra',      NULL,                                     TRUE),
('usman.ali@gmail.com', '$2b$12$abcdefghij1234567890AF', '+923001234505', 'Usman Ali',         'https://example.com/pics/usman.jpg',    TRUE),
('ayesha.iqbal@gmail.com', '$2b$12$abcdefghij1234567890AG', '+923001234506', 'Ayesha Iqbal',      'https://example.com/pics/ayesha.jpg',   TRUE),
('hassan.raza@gmail.com', '$2b$12$abcdefghij1234567890AH', '+923001234507', 'Hassan Raza',       NULL,                                     TRUE),
('maryam.noor@yahoo.com', '$2b$12$abcdefghij1234567890AI', '+923001234508', 'Maryam Noor',       'https://example.com/pics/maryam.jpg',   TRUE),
('zain.malik@gmail.com', '$2b$12$abcdefghij1234567890AJ', '+923001234509', 'Zain Malik',        'https://example.com/pics/zain.jpg',     TRUE),
('hira.sultan@hotmail.com', '$2b$12$abcdefghij1234567890AK', '+923001234510', 'Hira Sultan',       NULL,                                     TRUE),
('ali.nawaz@gmail.com', '$2b$12$abcdefghij1234567890AL', '+923001234511', 'Ali Nawaz',         'https://example.com/pics/ali.jpg',      TRUE),
('sana.tariq@gmail.com', '$2b$12$abcdefghij1234567890AM', '+923001234512', 'Sana Tariq',        'https://example.com/pics/sana.jpg',     TRUE),
('imran.shah@yahoo.com', '$2b$12$abcdefghij1234567890AN', '+923001234513', 'Imran Shah',        NULL,                                     TRUE),
('nadia.butt@gmail.com', '$2b$12$abcdefghij1234567890AO', '+923001234514', 'Nadia Butt',        'https://example.com/pics/nadia.jpg',    TRUE),
('faisal.javed@gmail.com', '$2b$12$abcdefghij1234567890AP', '+923001234515', 'Faisal Javed',      'https://example.com/pics/faisal.jpg',   TRUE),
('rabia.aslam@hotmail.com', '$2b$12$abcdefghij1234567890AQ', '+923001234516', 'Rabia Aslam',       NULL,                                     FALSE),
('kamran.yousaf@gmail.com', '$2b$12$abcdefghij1234567890AR', '+923001234517', 'Kamran Yousaf',     'https://example.com/pics/kamran.jpg',   TRUE),
('tanveer.akhtar@gmail.com', '$2b$12$abcdefghij1234567890AS', '+923001234518', 'Tanveer Akhtar',    'https://example.com/pics/tanveer.jpg',  TRUE),
('samina.rafiq@yahoo.com', '$2b$12$abcdefghij1234567890AT', '+923001234519', 'Samina Rafiq',      NULL,                                     TRUE),
('admin.system@rideshare.pk', '$2b$12$abcdefghij1234567890AU', '+923001234520', 'System Admin',      NULL,                                     TRUE);

INSERT INTO user_roles (user_id, role_id) VALUES
(1,  1),   
(2,  1),   
(3,  1),   
(3,  2),   
(4,  1),   
(5,  1),   
(5,  2),   
(6,  1),   
(7,  1),   
(7,  2),   
(8,  1),   
(9,  2),   
(10, 1),   
(11, 2),   
(12, 1),   
(13, 1),   
(14, 1),   
(15, 2),   
(16, 1),   
(17, 2),   
(18, 2),   
(19, 1),   
(20, 3),   
(20, 1),   
(9,  1);   

INSERT INTO vehicles (licence_plate, model, seats, hourly_rate, is_available, vehicle_type) VALUES
('LEA-1234', 'Toyota Corolla 2023', 5, 1500.00, TRUE, 'Sedan'),
('LHR-5678', 'Honda Civic 2024', 5, 1800.00, TRUE, 'Sedan'),
('ISB-9012', 'Suzuki Alto 2022', 4,  800.00, TRUE, 'Sedan'),
('KHI-3456', 'Toyota Yaris 2023', 5, 1200.00, TRUE, 'Sedan'),
('RWP-7890', 'Honda City 2024', 5, 1600.00, TRUE, 'Sedan'),
('FSD-2345', 'Suzuki Cultus 2023', 4,  900.00, TRUE, 'Sedan'),
('MUL-6789', 'Toyota Hilux 2023', 5, 2500.00, TRUE, 'Van'),
('PSH-0123', 'Kia Sportage 2024', 5, 3000.00, TRUE, 'SUV'),
('QTA-4567', 'Hyundai Tucson 2023', 5, 2800.00, TRUE, 'SUV'),
('SGD-8901', 'Suzuki Swift 2022', 4, 1000.00, TRUE, 'Sedan');

INSERT INTO rental_bookings (customer_id, vehicle_id, start_date, end_date, total_amount, status) VALUES
(1,  1, '2026-01-05', '2026-01-07', 72000.00, 'completed'),
(2,  2, '2026-01-10', '2026-01-12', 86400.00, 'completed'),
(4,  3, '2026-01-15', '2026-01-16', 19200.00, 'completed'),
(6,  4, '2026-01-20', '2026-01-22', 57600.00, 'completed'),
(8,  5, '2026-01-25', '2026-01-27', 76800.00, 'completed'),
(1,  6, '2026-02-01', '2026-02-03', 43200.00, 'completed'),
(10, 7, '2026-02-05', '2026-02-08', 180000.00,'completed'),
(12, 8, '2026-02-10', '2026-02-12', 144000.00, 'completed'),
(13, 9, '2026-02-12', '2026-02-14', 134400.00, 'completed'),
(14, 1, '2026-02-15', '2026-02-17', 72000.00, 'completed'),
(2,  3, '2026-02-18', '2026-02-20', 38400.00, 'completed'),
(4,  10,'2026-02-01', '2026-02-02', 24000.00, 'completed'),
(6,  2, '2026-02-05', '2026-02-06', 43200.00, 'cancelled'),
(19, 4, '2026-02-10', '2026-02-11', 28800.00, 'completed'),
(16, 6, '2026-02-15', '2026-02-18', 64800.00, 'completed');

INSERT INTO ride_bookings (customer_id, driver_id, vehicle_id, pickup_location, dropoff_location, pickup_time, dropoff_time, fare, status) VALUES
(1,  3,  1, 'Gulberg III, Lahore', 'DHA Phase 5, Lahore', '2026-01-10 08:30:00', '2026-01-10 09:15:00', 450.00, 'completed'),
(2,  5,  2, 'Model Town, Lahore', 'Johar Town, Lahore', '2026-01-11 10:00:00', '2026-01-11 10:30:00', 300.00, 'completed'),
(4,  7,  3, 'F-8 Markaz, Islamabad', 'Blue Area, Islamabad', '2026-01-12 14:00:00', '2026-01-12 14:20:00', 250.00, 'completed'),
(6,  9,  4, 'Clifton, Karachi', 'Saddar, Karachi', '2026-01-15 09:00:00', '2026-01-15 09:45:00', 500.00, 'completed'),
(8,  11, 5, 'Bahria Town, Rawalpindi', 'Faizabad, Rawalpindi', '2026-01-18 16:00:00', '2026-01-18 16:40:00', 350.00, 'completed'),
(10, 15, 6, 'Peoples Colony, Faisalabad', 'D Ground, Faisalabad', '2026-01-20 11:00:00', '2026-01-20 11:25:00', 200.00, 'completed'),
(12, 17, 7, 'Cantt Area, Multan', 'Hussain Agahi, Multan', '2026-01-22 13:00:00', '2026-01-22 13:35:00', 300.00, 'completed'),
(1,  18, 8, 'University Town, Peshawar', 'Hayatabad, Peshawar', '2026-01-25 07:30:00', '2026-01-25 08:00:00', 400.00, 'completed'),
(2,  3,  1, 'Wapda Town, Lahore', 'Airport, Lahore', '2026-02-01 05:00:00', '2026-02-01 05:50:00', 700.00, 'completed'),
(4,  5,  2, 'Satellite Town, Rawalpindi', 'Saddar, Rawalpindi', '2026-02-05 10:00:00', '2026-02-05 10:30:00', 280.00, 'completed'),
(6,  7,  4, 'North Nazimabad, Karachi', 'Korangi, Karachi', '2026-02-08 09:00:00', NULL, 600.00, 'completed'),
(8,  9,  5, 'G-9, Islamabad', 'I-8, Islamabad', '2026-02-10 15:00:00', NULL, 350.00,  'completed'),
(13, 11, 6, 'Samanabad, Faisalabad', 'Jinnah Colony, Faisalabad', '2026-02-12 12:00:00', NULL, 220.00,  'completed'),
(14, 15, 7, 'Shah Rukn-e-Alam, Multan', 'Bosan Road, Multan', '2026-02-14 08:00:00', NULL, 280.00, 'completed'),
(19, 17, 10,'GT Road, Sargodha', 'University Road, Sargodha', '2026-02-16 11:00:00', NULL, 180.00, 'cancelled');

INSERT INTO carpool_offers (driver_id, vehicle_id, origin, destination, departure_time, available_seats, price_per_seat, status) VALUES
(3,  1, 'Lahore', 'Islamabad', '2026-01-15 06:00:00', 3, 1500.00, 'completed'),
(5,  2, 'Lahore', 'Faisalabad', '2026-01-18 07:00:00', 3, 800.00, 'completed'),
(7,  4, 'Islamabad', 'Lahore', '2026-01-20 08:00:00', 3, 1500.00, 'completed'),
(9,  5, 'Rawalpindi','Islamabad', '2026-01-22 09:00:00', 2, 300.00, 'completed'),
(11, 6, 'Faisalabad', 'Lahore', '2026-01-25 06:30:00', 2, 900.00, 'completed'),
(15, 7, 'Multan', 'Lahore', '2026-02-01 05:00:00', 4, 2000.00, 'completed'),
(17, 10,'Sargodha', 'Faisalabad', '2026-02-05 07:00:00', 3, 500.00, 'open'),
(18, 8, 'Peshawar', 'Islamabad', '2026-02-08 06:00:00', 3, 1200.00, 'open'),
(3,  1, 'Lahore', 'Multan', '2026-02-12 07:00:00', 3, 1800.00, 'open'),
(5,  2, 'Lahore', 'Karachi', '2026-02-15 05:00:00', 3, 4000.00, 'open'),
(9,  4, 'Islamabad', 'Peshawar', '2026-02-18 08:00:00', 3, 800.00,  'open'),
(11, 6, 'Faisalabad', 'Islamabad', '2026-02-20 06:00:00', 2, 1100.00, 'cancelled');

INSERT INTO carpool_bookings (carpool_id, passenger_id, seats_booked, booking_time, status) VALUES
(1, 1,  1, '2026-01-14 10:00:00', 'completed'),
(1, 2,  1, '2026-01-14 11:00:00', 'completed'),
(1, 4,  1, '2026-01-14 12:00:00', 'completed'),
(2, 6,  1, '2026-01-17 09:00:00', 'completed'),
(2, 8,  2, '2026-01-17 10:00:00', 'completed'),
(3, 10, 1, '2026-01-19 14:00:00', 'completed'),
(3, 12, 2, '2026-01-19 15:00:00', 'completed'),
(4, 1,  1, '2026-01-21 08:00:00', 'completed'),
(4, 14, 1, '2026-01-21 09:00:00', 'completed'),
(5, 2,  1, '2026-01-24 07:00:00', 'completed'),
(5, 13, 1, '2026-01-24 08:00:00', 'completed'),
(6, 4,  2, '2026-01-31 10:00:00', 'completed'),
(6, 8,  1, '2026-01-31 11:00:00', 'completed'),
(7, 6,  1, '2026-02-04 12:00:00', 'confirmed'),
(8, 19, 2, '2026-02-07 09:00:00', 'confirmed');

INSERT INTO rental_payments (user_id, rental_id, amount, payment_method, payment_time, payment_status) VALUES
(1,  1,  72000.00, 'card', '2026-01-05 09:00:00', 'completed'),
(2,  2,  86400.00, 'card', '2026-01-10 10:00:00', 'completed'),
(4,  3,  19200.00, 'cash', '2026-01-15 11:00:00', 'completed'),
(6,  4,  57600.00, 'card', '2026-01-20 12:00:00', 'completed'),
(8,  5,  76800.00, 'card', '2026-01-25 09:00:00', 'completed');

INSERT INTO ride_payments (user_id, ride_id, amount, payment_method, payment_time, payment_status) VALUES
(1,  1,  450.00, 'cash', '2026-01-10 09:30:00', 'completed'),
(2,  2,  300.00, 'card', '2026-01-11 10:45:00', 'completed'),
(4,  3,  250.00, 'cash', '2026-01-12 14:30:00', 'completed'),
(6,  4,  500.00, 'card', '2026-01-15 10:00:00', 'completed'),
(8,  5,  350.00, 'card', '2026-01-18 17:00:00', 'completed'),
(10, 6,  200.00, 'cash', '2026-01-20 11:30:00', 'completed'),
(12, 7,  300.00, 'cash', '2026-01-22 14:00:00', 'completed');

INSERT INTO carpool_payments (user_id, carpool_booking_id, amount, payment_method, payment_time, payment_status) VALUES
(1,  1,  1500.00, 'card', '2026-01-14 10:30:00', 'completed'),
(2,  2,  1500.00, 'card', '2026-01-14 11:30:00', 'completed'),
(6,  4,  800.00, 'cash', '2026-01-17 09:30:00', 'completed'),
(10, 6,  1500.00, 'card', '2026-01-19 14:30:00', 'completed'),
(1,  8,  300.00, 'cash', '2026-01-21 08:30:00', 'completed'),
(4,  12, 4000.00, 'card', '2026-01-31 10:30:00', 'completed'),
(6,  14, 500.00, 'card', '2026-02-04 12:30:00', 'pending'),
(19, 15, 2400.00, 'card', '2026-02-07 09:30:00', 'pending');

INSERT INTO reviews (reviewer_id, reviewee_id, vehicle_id, booking_type, rating, comment) VALUES
(1,  3,  1, 'ride', 5, 'Excellent ride! Very smooth driving and clean car.'),
(2,  5,  2, 'ride', 4, 'Good ride, arrived on time. Car was comfortable.'),
(4,  7,  3, 'ride', 5, 'Amazing driver. Knew the best routes in Islamabad.'),
(6,  9,  4, 'ride', 3, 'Average experience. Car could have been cleaner.'),
(8,  11, 5, 'ride', 4, 'Nice ride. Driver was polite and professional.'),
(10, 15, 6, 'ride', 5, 'Best ride experience! Highly recommend this driver.'),
(12, 17, 7, 'ride', 4, 'Good driver, comfortable vehicle for long trips.'),
(1,  18, 8, 'ride', 5, 'Kia Sportage was brilliant. Very smooth ride.'),
(1,  3,  1, 'carpool', 4, 'Great carpool to Islamabad, good conversation too.'),
(2,  3,  1, 'carpool', 5, 'Punctual departure, comfortable seats, fair price.'),
(6,  5,  2, 'carpool', 4, 'Nice carpool to Faisalabad, would ride again.'),
(10, 7,  4, 'carpool', 3, 'Okay trip, but car was a bit cramped with full seats.'),
(1, NULL, 1, 'rental', 5, 'Toyota Corolla was in perfect condition. Great rental!'),
(2, NULL, 2, 'rental', 4, 'Honda Civic was excellent. Would rent again.'),
(4, NULL, 3, 'rental', 4, 'Suzuki Alto was fuel-efficient and perfect for city driving.');