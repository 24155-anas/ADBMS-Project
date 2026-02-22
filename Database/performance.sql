-- QUERY 1: Search user by email
-- Before indexing
DROP INDEX IF EXISTS users_email_search_index;
EXPLAIN ANALYZE
SELECT user_id, full_name, email, phone 
FROM users 
WHERE email = 'zain.malik@gmail.com';

-- Create index
CREATE INDEX users_email_search_index ON users (email);
-- After indexing
EXPLAIN ANALYZE
SELECT user_id, full_name, email, phone 
FROM users 
WHERE email = 'zain.malik@gmail.com';

--------------------------------------------------------[RESULT]--------------------------------------------------------
--DROP INDEX
--                                           QUERY PLAN                                            
---------------------------------------------------------------------------------------------------
-- Seq Scan on users  (cost=0.00..1.25 rows=1 width=796) (actual time=0.009..0.010 rows=1 loops=1)
--   Filter: ((email)::text = 'zain.malik@gmail.com'::text)
--   Rows Removed by Filter: 19
-- Planning Time: 0.336 ms
-- Execution Time: 0.035 ms
--(5 rows)
--
--CREATE INDEX
--                                           QUERY PLAN                                            
---------------------------------------------------------------------------------------------------
-- Seq Scan on users  (cost=0.00..1.25 rows=1 width=796) (actual time=0.007..0.009 rows=1 loops=1)
--   Filter: ((email)::text = 'zain.malik@gmail.com'::text)
--   Rows Removed by Filter: 19
-- Planning Time: 0.129 ms
-- Execution Time: 0.019 ms
--(5 rows)
--DROP INDEX
--------------------------------------------------------------------------------------------------------------------------

-- QUERY 2: Find rentals by vehicle ID
-- Before indexing
DROP INDEX IF EXISTS rentals_vehicle_history_index;
EXPLAIN ANALYZE
SELECT rental_id, customer_id, start_date, end_date, status 
FROM rental_bookings 
WHERE vehicle_id = 1;

-- Create index
CREATE INDEX rentals_vehicle_history_index ON rental_bookings (vehicle_id);
-- After indexing
EXPLAIN ANALYZE
SELECT rental_id, customer_id, start_date, end_date, status 
FROM rental_bookings 
WHERE vehicle_id = 1;

--------------------------------------------------------[RESULT]--------------------------------------------------------
--DROP INDEX
--                                                QUERY PLAN                                                
------------------------------------------------------------------------------------------------------------
-- Seq Scan on rental_bookings  (cost=0.00..1.19 rows=1 width=74) (actual time=0.007..0.009 rows=2 loops=1)
--   Filter: (vehicle_id = 1)
--   Rows Removed by Filter: 13
-- Planning Time: 0.248 ms
-- Execution Time: 0.018 ms
--(5 rows)
--
--CREATE INDEX
--                                                QUERY PLAN                                                
------------------------------------------------------------------------------------------------------------
-- Seq Scan on rental_bookings  (cost=0.00..1.19 rows=1 width=74) (actual time=0.006..0.008 rows=2 loops=1)
--   Filter: (vehicle_id = 1)
--   Rows Removed by Filter: 13
-- Planning Time: 0.096 ms
-- Execution Time: 0.018 ms
--(5 rows)
------------------------------------------------------------------------------------------------------------------------


-- QUERY 3: Find active carpool offers (status = 'open')
-- Before indexing
DROP INDEX IF EXISTS carpools_status_filter_index;
EXPLAIN ANALYZE
SELECT 
    co.carpool_id,
    co.origin,
    co.destination,
    co.departure_time,
    co.available_seats,
    co.price_per_seat,
    u.full_name AS driver_name
FROM carpool_offers co
JOIN users u ON co.driver_id = u.user_id
WHERE co.status = 'open';

-- Create index (already defined in schema)
CREATE INDEX carpools_status_filter_index ON carpool_offers (status);
-- After indexing
EXPLAIN ANALYZE
SELECT 
    co.carpool_id,
    co.origin,
    co.destination,
    co.departure_time,
    co.available_seats,
    co.price_per_seat,
    u.full_name AS driver_name
FROM carpool_offers co
JOIN users u ON co.driver_id = u.user_id
WHERE co.status = 'open';


--------------------------------------------------------[RESULT]--------------------------------------------------------
--DROP INDEX
--                                                        QUERY PLAN                                                        
--------------------------------------------------------------------------------------------------------------------------
-- Hash Join  (cost=1.16..2.45 rows=1 width=1282) (actual time=0.064..0.069 rows=5 loops=1)
--   Hash Cond: (u.user_id = co.driver_id)
--   ->  Seq Scan on users u  (cost=0.00..1.20 rows=20 width=222) (actual time=0.012..0.014 rows=20 loops=1)
--   ->  Hash  (cost=1.15..1.15 rows=1 width=1068) (actual time=0.031..0.031 rows=5 loops=1)
--         Buckets: 1024  Batches: 1  Memory Usage: 9kB
--         ->  Seq Scan on carpool_offers co  (cost=0.00..1.15 rows=1 width=1068) (actual time=0.013..0.016 rows=5 loops=1)
--               Filter: ((status)::text = 'open'::text)
--               Rows Removed by Filter: 7
-- Planning Time: 0.630 ms
-- Execution Time: 0.107 ms
--(10 rows)

--CREATE INDEX
--                                                        QUERY PLAN                                                        
--------------------------------------------------------------------------------------------------------------------------
-- Hash Join  (cost=1.16..2.45 rows=1 width=1282) (actual time=0.082..0.090 rows=5 loops=1)
--   Hash Cond: (u.user_id = co.driver_id)
--   ->  Seq Scan on users u  (cost=0.00..1.20 rows=20 width=222) (actual time=0.024..0.026 rows=20 loops=1)
--   ->  Hash  (cost=1.15..1.15 rows=1 width=1068) (actual time=0.032..0.033 rows=5 loops=1)
--         Buckets: 1024  Batches: 1  Memory Usage: 9kB
--         ->  Seq Scan on carpool_offers co  (cost=0.00..1.15 rows=1 width=1068) (actual time=0.017..0.021 rows=5 loops=1)
--               Filter: ((status)::text = 'open'::text)
--               Rows Removed by Filter: 7
-- Planning Time: 0.623 ms
-- Execution Time: 0.124 ms
--(10 rows)

--------------------------------------------------------------------------------------------------------------------------