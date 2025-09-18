-- public.chat_messages definition

-- Drop table

-- DROP TABLE public.chat_messages;

CREATE TABLE public.chat_messages (
	id serial4 NOT NULL,
	session_id varchar(100) NOT NULL,
	message_type varchar(20) DEFAULT 'text'::character varying NULL,
	sender_type varchar(20) NOT NULL,
	sender_id varchar(100) NULL,
	message_text text NOT NULL,
	metadata jsonb DEFAULT '{}'::jsonb NULL,
	is_read bool DEFAULT false NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT chat_messages_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_chat_messages_created ON public.chat_messages USING btree (created_at);
CREATE INDEX idx_chat_messages_session ON public.chat_messages USING btree (session_id);


-- public.customer_tier_rules definition

-- Drop table

-- DROP TABLE public.customer_tier_rules;

CREATE TABLE public.customer_tier_rules (
	id serial4 NOT NULL,
	tier_name varchar(20) NOT NULL,
	min_spending numeric(10, 2) DEFAULT 0.00 NULL,
	min_visits int4 DEFAULT 0 NULL,
	min_points int4 DEFAULT 0 NULL,
	calculation_multiplier numeric(4, 2) DEFAULT 1.00 NULL,
	benefits text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT customer_tier_rules_pkey PRIMARY KEY (id),
	CONSTRAINT customer_tier_rules_tier_name_key UNIQUE (tier_name)
);


-- public.generated_products definition

-- Drop table

-- DROP TABLE public.generated_products;

CREATE TABLE public.generated_products (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	batch int4 NULL,
	brand varchar NULL,
	segment varchar NULL,
	num_of_products int4 NULL,
	generated_product json NULL,
	prompt text NULL,
	raw_response text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT generated_products_pk PRIMARY KEY (id)
);


-- public.loyalty_tiers definition

-- Drop table

-- DROP TABLE public.loyalty_tiers;

CREATE TABLE public.loyalty_tiers (
	id serial4 NOT NULL,
	tier_name varchar(50) NOT NULL,
	tier_level int4 NOT NULL,
	min_spending numeric(10, 2) NOT NULL,
	min_visits int4 NOT NULL,
	min_points int4 NOT NULL,
	points_multiplier numeric(4, 2) DEFAULT 1.00 NULL,
	benefits jsonb DEFAULT '{}'::jsonb NULL,
	tier_color varchar(7) DEFAULT '#000000'::character varying NULL,
	tier_icon varchar(50) NULL,
	is_active bool DEFAULT true NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT loyalty_tiers_pkey PRIMARY KEY (id),
	CONSTRAINT loyalty_tiers_tier_level_key UNIQUE (tier_level),
	CONSTRAINT loyalty_tiers_tier_name_key UNIQUE (tier_name)
);
CREATE INDEX idx_loyalty_tiers_active ON public.loyalty_tiers USING btree (is_active);
CREATE INDEX idx_loyalty_tiers_level ON public.loyalty_tiers USING btree (tier_level);


-- public.roles definition

-- Drop table

-- DROP TABLE public.roles;

CREATE TABLE public.roles (
	id serial4 NOT NULL,
	"name" varchar(50) NOT NULL,
	description text NULL,
	permissions jsonb DEFAULT '{}'::jsonb NULL,
	is_active bool DEFAULT true NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT roles_name_key UNIQUE (name),
	CONSTRAINT roles_pkey PRIMARY KEY (id)
);


-- public.store_locations definition

-- Drop table

-- DROP TABLE public.store_locations;

CREATE TABLE public.store_locations (
	id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	address varchar(500) NOT NULL,
	city varchar(100) NOT NULL,
	state varchar(50) NOT NULL,
	zip_code varchar(20) NOT NULL,
	country varchar(100) DEFAULT 'USA'::character varying NULL,
	latitude numeric(10, 8) NOT NULL,
	longitude numeric(11, 8) NOT NULL,
	phone varchar(20) NOT NULL,
	email varchar(255) NULL,
	website varchar(500) NULL,
	description text NULL,
	manager varchar(100) NULL,
	capacity int4 NULL,
	parking_available bool DEFAULT false NULL,
	wheelchair_accessible bool DEFAULT false NULL,
	wifi_available bool DEFAULT false NULL,
	rating numeric(3, 2) DEFAULT 0.00 NULL,
	review_count int4 DEFAULT 0 NULL,
	featured bool DEFAULT false NULL,
	is_open bool DEFAULT true NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT store_locations_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_store_locations_city_state ON public.store_locations USING btree (city, state);
CREATE INDEX idx_store_locations_featured ON public.store_locations USING btree (featured);
CREATE INDEX idx_store_locations_lat_lng ON public.store_locations USING btree (latitude, longitude);
CREATE INDEX idx_store_locations_open ON public.store_locations USING btree (is_open);


-- public.system_settings definition

-- Drop table

-- DROP TABLE public.system_settings;

CREATE TABLE public.system_settings (
	id serial4 NOT NULL,
	setting_key varchar(100) NOT NULL,
	setting_value text NULL,
	setting_type varchar(50) DEFAULT 'text'::character varying NULL,
	description text NULL,
	category varchar(50) DEFAULT 'general'::character varying NULL,
	is_encrypted bool DEFAULT false NULL,
	is_active bool DEFAULT true NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by varchar(100) NULL,
	updated_by varchar(100) NULL,
	CONSTRAINT system_settings_pkey PRIMARY KEY (id),
	CONSTRAINT system_settings_setting_key_key UNIQUE (setting_key)
);
CREATE INDEX idx_system_settings_active ON public.system_settings USING btree (is_active);
CREATE INDEX idx_system_settings_category ON public.system_settings USING btree (category);
CREATE INDEX idx_system_settings_key ON public.system_settings USING btree (setting_key);


-- public.store_events definition

-- Drop table

-- DROP TABLE public.store_events;

CREATE TABLE public.store_events (
	id serial4 NOT NULL,
	store_id int4 NULL,
	title varchar(255) NOT NULL,
	description text NULL,
	start_date date NOT NULL,
	end_date date NOT NULL,
	start_time time NULL,
	end_time time NULL,
	"type" varchar(50) NOT NULL,
	capacity int4 NULL,
	current_attendees int4 DEFAULT 0 NULL,
	is_registration_required bool DEFAULT false NULL,
	price numeric(10, 2) DEFAULT 0.00 NULL,
	currency varchar(3) DEFAULT 'USD'::character varying NULL,
	"location" varchar(255) NULL,
	contact_person varchar(100) NULL,
	contact_phone varchar(20) NULL,
	contact_email varchar(255) NULL,
	is_active bool DEFAULT true NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT store_events_pkey PRIMARY KEY (id),
	CONSTRAINT store_events_type_check CHECK (((type)::text = ANY ((ARRAY['promotion'::character varying, 'workshop'::character varying, 'sale'::character varying, 'event'::character varying, 'training'::character varying])::text[]))),
	CONSTRAINT store_events_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.store_locations(id) ON DELETE CASCADE
);
CREATE INDEX idx_store_events_active ON public.store_events USING btree (is_active);
CREATE INDEX idx_store_events_date_range ON public.store_events USING btree (start_date, end_date);
CREATE INDEX idx_store_events_store_id ON public.store_events USING btree (store_id);
CREATE INDEX idx_store_events_type ON public.store_events USING btree (type);


-- public.store_hours definition

-- Drop table

-- DROP TABLE public.store_hours;

CREATE TABLE public.store_hours (
	id serial4 NOT NULL,
	store_id int4 NULL,
	day_of_week int4 NOT NULL,
	open_time time NULL,
	close_time time NULL,
	is_closed bool DEFAULT false NULL,
	special_hours text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT store_hours_day_of_week_check CHECK (((day_of_week >= 1) AND (day_of_week <= 7))),
	CONSTRAINT store_hours_pkey PRIMARY KEY (id),
	CONSTRAINT store_hours_store_id_day_of_week_key UNIQUE (store_id, day_of_week),
	CONSTRAINT store_hours_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.store_locations(id) ON DELETE CASCADE
);
CREATE INDEX idx_store_hours_day ON public.store_hours USING btree (day_of_week);
CREATE INDEX idx_store_hours_store_id ON public.store_hours USING btree (store_id);


-- public.store_services definition

-- Drop table

-- DROP TABLE public.store_services;

CREATE TABLE public.store_services (
	id serial4 NOT NULL,
	store_id int4 NULL,
	"name" varchar(255) NOT NULL,
	description text NULL,
	category varchar(100) NOT NULL,
	duration int4 NOT NULL,
	price numeric(10, 2) NOT NULL,
	currency varchar(3) DEFAULT 'USD'::character varying NULL,
	is_available bool DEFAULT true NULL,
	requires_appointment bool DEFAULT true NULL,
	max_capacity int4 NULL,
	requirements text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT store_services_pkey PRIMARY KEY (id),
	CONSTRAINT store_services_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.store_locations(id) ON DELETE CASCADE
);
CREATE INDEX idx_store_services_available ON public.store_services USING btree (is_available);
CREATE INDEX idx_store_services_category ON public.store_services USING btree (category);
CREATE INDEX idx_store_services_store_id ON public.store_services USING btree (store_id);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id serial4 NOT NULL,
	username varchar(50) NULL,
	email varchar(255) NOT NULL,
	password_hash varchar(255) NOT NULL,
	first_name varchar(100) NOT NULL,
	last_name varchar(100) NOT NULL,
	role_id int4 NULL,
	is_active bool DEFAULT true NULL,
	is_locked bool DEFAULT false NULL,
	failed_login_attempts int4 DEFAULT 0 NULL,
	last_login timestamp NULL,
	password_changed_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	password_expires_at timestamp NULL,
	must_change_password bool DEFAULT false NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by int4 NULL,
	updated_by int4 NULL,
	phone varchar(20) NULL,
	marketing_consent bool DEFAULT false NULL,
	"role" varchar(50) DEFAULT 'customer'::character varying NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
	CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
	CONSTRAINT users_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);
CREATE INDEX idx_users_active ON public.users USING btree (is_active);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_role_id ON public.users USING btree (role_id);
CREATE INDEX idx_users_username ON public.users USING btree (username);


-- public.appointments definition

-- Drop table

-- DROP TABLE public.appointments;

CREATE TABLE public.appointments (
	id serial4 NOT NULL,
	user_id int4 NULL,
	store_id int4 NULL,
	service_id int4 NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	status varchar(20) DEFAULT 'scheduled'::character varying NULL,
	notes text NULL,
	estimated_duration int4 NOT NULL,
	actual_duration int4 NULL,
	total_cost numeric(10, 2) NOT NULL,
	payment_status varchar(20) DEFAULT 'pending'::character varying NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT appointments_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'refunded'::character varying])::text[]))),
	CONSTRAINT appointments_pkey PRIMARY KEY (id),
	CONSTRAINT appointments_status_check CHECK (((status)::text = ANY ((ARRAY['scheduled'::character varying, 'confirmed'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'no_show'::character varying])::text[]))),
	CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.store_services(id) ON DELETE CASCADE,
	CONSTRAINT appointments_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.store_locations(id) ON DELETE CASCADE,
	CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_appointments_date_time ON public.appointments USING btree (date, "time");
CREATE INDEX idx_appointments_service_id ON public.appointments USING btree (service_id);
CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);
CREATE INDEX idx_appointments_store_id ON public.appointments USING btree (store_id);
CREATE INDEX idx_appointments_user_id ON public.appointments USING btree (user_id);


-- public.customers definition

-- Drop table

-- DROP TABLE public.customers;

CREATE TABLE public.customers (
	id serial4 NOT NULL,
	loyalty_number varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	email varchar(255) NULL,
	phone varchar(20) NULL,
	points int4 DEFAULT 0 NULL,
	total_spent numeric(10, 2) DEFAULT 0.00 NULL,
	visit_count int4 DEFAULT 0 NULL,
	last_visit timestamp NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	notes text NULL,
	preferred_contact varchar(20) DEFAULT 'email'::character varying NULL,
	date_of_birth date NULL,
	address_line1 varchar(255) NULL,
	address_line2 varchar(255) NULL,
	city varchar(100) NULL,
	state varchar(50) NULL,
	zip_code varchar(20) NULL,
	marketing_consent bool DEFAULT false NULL,
	member_status varchar(50) DEFAULT 'Active'::character varying NULL,
	enrollment_date date DEFAULT CURRENT_DATE NULL,
	member_type varchar(20) DEFAULT 'Individual'::character varying NULL,
	sf_id varchar(100) NULL,
	customer_tier varchar(20) DEFAULT 'Bronze'::character varying NULL,
	tier_calculation_number numeric(10, 2) DEFAULT 0.00 NULL,
	created_by_user int4 NULL,
	user_id int4 NULL,
	CONSTRAINT customers_loyalty_number_key UNIQUE (loyalty_number),
	CONSTRAINT customers_pkey PRIMARY KEY (id),
	CONSTRAINT customers_created_by_user_fkey FOREIGN KEY (created_by_user) REFERENCES public.users(id),
	CONSTRAINT customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE INDEX idx_customers_created_at ON public.customers USING btree (created_at);
CREATE INDEX idx_customers_customer_tier ON public.customers USING btree (customer_tier);
CREATE INDEX idx_customers_email ON public.customers USING btree (lower((email)::text));
CREATE INDEX idx_customers_enrollment_date ON public.customers USING btree (enrollment_date);
CREATE INDEX idx_customers_last_visit ON public.customers USING btree (last_visit);
CREATE INDEX idx_customers_loyalty_number ON public.customers USING btree (loyalty_number);
CREATE INDEX idx_customers_member_status ON public.customers USING btree (member_status);
CREATE INDEX idx_customers_member_type ON public.customers USING btree (member_type);
CREATE INDEX idx_customers_name ON public.customers USING btree (lower((name)::text));
CREATE INDEX idx_customers_phone ON public.customers USING btree (phone);
CREATE INDEX idx_customers_sf_id ON public.customers USING btree (sf_id);
CREATE INDEX idx_customers_tier_calculation_number ON public.customers USING btree (tier_calculation_number);


-- public.locations definition

-- Drop table

-- DROP TABLE public.locations;

CREATE TABLE public.locations (
	id serial4 NOT NULL,
	store_code varchar(10) NOT NULL,
	store_name varchar(255) NOT NULL,
	brand varchar(100) NOT NULL,
	address_line1 varchar(255) NOT NULL,
	address_line2 varchar(255) NULL,
	city varchar(100) NOT NULL,
	state varchar(50) NOT NULL,
	zip_code varchar(20) NOT NULL,
	country varchar(100) DEFAULT 'USA'::character varying NULL,
	phone varchar(20) NULL,
	email varchar(255) NULL,
	tax_rate numeric(5, 4) DEFAULT 0.0800 NULL,
	currency varchar(3) DEFAULT 'USD'::character varying NULL,
	timezone varchar(50) DEFAULT 'America/New_York'::character varying NULL,
	logo_url text NULL,
	logo_base64 text NULL,
	is_active bool DEFAULT true NULL,
	business_hours jsonb NULL,
	manager_name varchar(255) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by_user int4 NULL,
	CONSTRAINT locations_pkey PRIMARY KEY (id),
	CONSTRAINT locations_store_code_key UNIQUE (store_code),
	CONSTRAINT locations_created_by_user_fkey FOREIGN KEY (created_by_user) REFERENCES public.users(id)
);
CREATE INDEX idx_locations_active ON public.locations USING btree (is_active);
CREATE INDEX idx_locations_store_code ON public.locations USING btree (store_code);


-- public.password_reset_tokens definition

-- Drop table

-- DROP TABLE public.password_reset_tokens;

CREATE TABLE public.password_reset_tokens (
	id serial4 NOT NULL,
	user_id int4 NULL,
	"token" varchar(255) NOT NULL,
	expires_at timestamp NOT NULL,
	used_at timestamp NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
	CONSTRAINT password_reset_tokens_token_key UNIQUE (token),
	CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens USING btree (token);
CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id);


-- public.products definition

-- Drop table

-- DROP TABLE public.products;

CREATE TABLE public.products (
	id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	price numeric(10, 2) NOT NULL,
	category varchar(100) NOT NULL,
	stock int4 DEFAULT 0 NOT NULL,
	image varchar(10) DEFAULT '📦'::character varying NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	sku varchar(50) NULL,
	product_type varchar(100) NULL,
	laptop_size varchar(20) NULL,
	brand varchar(100) NULL,
	collection varchar(100) NULL,
	material varchar(100) NULL,
	gender varchar(20) NULL,
	color varchar(50) NULL,
	description text NULL,
	dimensions varchar(100) NULL,
	weight numeric(5, 2) NULL,
	warranty_info text NULL,
	care_instructions text NULL,
	main_image_url text NULL,
	is_active bool DEFAULT true NULL,
	featured bool DEFAULT false NULL,
	sort_order int4 DEFAULT 0 NULL,
	sf_id varchar NULL,
	created_by_user int4 NULL,
	stock_status varchar(20) DEFAULT 'in_stock'::character varying NULL,
	low_stock_threshold int4 DEFAULT 10 NULL,
	is_featured bool DEFAULT false NULL,
	CONSTRAINT products_pkey PRIMARY KEY (id),
	CONSTRAINT products_sku_key UNIQUE (sku),
	CONSTRAINT products_created_by_user_fkey FOREIGN KEY (created_by_user) REFERENCES public.users(id)
);
CREATE INDEX idx_products_active ON public.products USING btree (is_active);
CREATE INDEX idx_products_brand ON public.products USING btree (brand);
CREATE INDEX idx_products_collection ON public.products USING btree (collection);
CREATE INDEX idx_products_product_type ON public.products USING btree (product_type);
CREATE INDEX idx_products_sku ON public.products USING btree (sku);


-- public.store_inventory definition

-- Drop table

-- DROP TABLE public.store_inventory;

CREATE TABLE public.store_inventory (
	id serial4 NOT NULL,
	store_id int4 NULL,
	product_id int4 NULL,
	quantity int4 DEFAULT 0 NOT NULL,
	reserved_quantity int4 DEFAULT 0 NULL,
	available_quantity int4 GENERATED ALWAYS AS (quantity - reserved_quantity) STORED NULL,
	low_stock_threshold int4 DEFAULT 10 NULL,
	last_updated timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT store_inventory_pkey PRIMARY KEY (id),
	CONSTRAINT store_inventory_store_id_product_id_key UNIQUE (store_id, product_id),
	CONSTRAINT store_inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
	CONSTRAINT store_inventory_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.store_locations(id) ON DELETE CASCADE
);
CREATE INDEX idx_store_inventory_product_id ON public.store_inventory USING btree (product_id);
CREATE INDEX idx_store_inventory_quantity ON public.store_inventory USING btree (quantity);
CREATE INDEX idx_store_inventory_store_id ON public.store_inventory USING btree (store_id);


-- public.transactions definition

-- Drop table

-- DROP TABLE public.transactions;

CREATE TABLE public.transactions (
	id serial4 NOT NULL,
	customer_id int4 NULL,
	subtotal numeric(10, 2) NOT NULL,
	tax numeric(10, 2) NOT NULL,
	total numeric(10, 2) NOT NULL,
	payment_method varchar(50) NOT NULL,
	amount_received numeric(10, 2) NULL,
	change_amount numeric(10, 2) DEFAULT 0 NULL,
	points_earned int4 DEFAULT 0 NULL,
	points_redeemed int4 DEFAULT 0 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	location_id int4 NULL,
	discount_amount numeric(10, 2) DEFAULT 0.00 NULL,
	discount_type varchar(20) NULL,
	discount_reason varchar(255) NULL,
	card_last_four varchar(4) NULL,
	card_type varchar(20) NULL,
	payment_reference varchar(100) NULL,
	created_by_user int4 NULL,
	CONSTRAINT transactions_pkey PRIMARY KEY (id),
	CONSTRAINT transactions_created_by_user_fkey FOREIGN KEY (created_by_user) REFERENCES public.users(id),
	CONSTRAINT transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
	CONSTRAINT transactions_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id)
);
CREATE INDEX idx_transactions_created_at ON public.transactions USING btree (created_at);
CREATE INDEX idx_transactions_customer_id ON public.transactions USING btree (customer_id);
CREATE INDEX idx_transactions_location_id ON public.transactions USING btree (location_id);

-- Table Triggers

create trigger trigger_update_location_inventory after
insert
    on
    public.transactions for each row execute function update_location_inventory();
create trigger trigger_update_customer_tier_and_stats after
insert
    on
    public.transactions for each row execute function update_customer_tier_and_stats();


-- public.user_activity_log definition

-- Drop table

-- DROP TABLE public.user_activity_log;

CREATE TABLE public.user_activity_log (
	id serial4 NOT NULL,
	user_id int4 NULL,
	activity_type varchar(50) NOT NULL,
	description text NULL,
	ip_address inet NULL,
	user_agent text NULL,
	metadata jsonb DEFAULT '{}'::jsonb NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT user_activity_log_pkey PRIMARY KEY (id),
	CONSTRAINT user_activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE INDEX idx_user_activity_log_created_at ON public.user_activity_log USING btree (created_at);
CREATE INDEX idx_user_activity_log_user_id ON public.user_activity_log USING btree (user_id);


-- public.user_sessions definition

-- Drop table

-- DROP TABLE public.user_sessions;

CREATE TABLE public.user_sessions (
	id serial4 NOT NULL,
	user_id int4 NULL,
	session_token varchar(255) NOT NULL,
	ip_address inet NULL,
	user_agent text NULL,
	is_active bool DEFAULT true NULL,
	expires_at timestamp NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	token_hash varchar(255) NULL,
	CONSTRAINT user_sessions_pkey PRIMARY KEY (id),
	CONSTRAINT user_sessions_session_token_key UNIQUE (session_token),
	CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_user_sessions_expires ON public.user_sessions USING btree (expires_at);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions USING btree (expires_at);
CREATE INDEX idx_user_sessions_token ON public.user_sessions USING btree (session_token);
CREATE INDEX idx_user_sessions_token_hash ON public.user_sessions USING btree (token_hash);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


-- public.user_settings definition

-- Drop table

-- DROP TABLE public.user_settings;

CREATE TABLE public.user_settings (
	id serial4 NOT NULL,
	user_identifier varchar(255) NOT NULL,
	selected_location_id int4 NULL,
	theme_mode varchar(20) DEFAULT 'light'::character varying NULL,
	"language" varchar(10) DEFAULT 'en'::character varying NULL,
	currency_format varchar(10) DEFAULT 'USD'::character varying NULL,
	date_format varchar(20) DEFAULT 'MM/DD/YYYY'::character varying NULL,
	notifications_enabled bool DEFAULT true NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT user_settings_pkey PRIMARY KEY (id),
	CONSTRAINT user_settings_user_identifier_key UNIQUE (user_identifier),
	CONSTRAINT user_settings_selected_location_id_fkey FOREIGN KEY (selected_location_id) REFERENCES public.locations(id)
);
CREATE INDEX idx_user_settings_identifier ON public.user_settings USING btree (user_identifier);


-- public.work_orders definition

-- Drop table

-- DROP TABLE public.work_orders;

CREATE TABLE public.work_orders (
	id serial4 NOT NULL,
	work_order_number varchar(20) NOT NULL,
	location_id int4 NOT NULL,
	customer_id int4 NOT NULL,
	subject varchar(255) NOT NULL,
	description text NULL,
	work_type varchar(100) NOT NULL,
	priority varchar(20) DEFAULT 'Medium'::character varying NULL,
	status varchar(50) DEFAULT 'New'::character varying NULL,
	assigned_to varchar(255) NULL,
	created_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	scheduled_date timestamp NULL,
	start_date timestamp NULL,
	estimated_completion_date date NULL,
	actual_completion_date timestamp NULL,
	labor_hours numeric(5, 2) DEFAULT 0.00 NULL,
	labor_rate numeric(8, 2) DEFAULT 0.00 NULL,
	parts_cost numeric(10, 2) DEFAULT 0.00 NULL,
	total_cost numeric(10, 2) DEFAULT 0.00 NULL,
	customer_notes text NULL,
	internal_notes text NULL,
	created_by varchar(255) NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT work_orders_pkey PRIMARY KEY (id),
	CONSTRAINT work_orders_work_order_number_key UNIQUE (work_order_number),
	CONSTRAINT work_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
	CONSTRAINT work_orders_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id)
);
CREATE INDEX idx_work_orders_created_date ON public.work_orders USING btree (created_date);
CREATE INDEX idx_work_orders_customer ON public.work_orders USING btree (customer_id);
CREATE INDEX idx_work_orders_location ON public.work_orders USING btree (location_id);
CREATE INDEX idx_work_orders_priority ON public.work_orders USING btree (priority);
CREATE INDEX idx_work_orders_status ON public.work_orders USING btree (status);

-- Table Triggers

create trigger trigger_set_work_order_number before
insert
    on
    public.work_orders for each row execute function set_work_order_number();
create trigger trigger_log_work_order_status_change before
update
    on
    public.work_orders for each row execute function log_work_order_status_change();


-- public.appointment_images definition

-- Drop table

-- DROP TABLE public.appointment_images;

CREATE TABLE public.appointment_images (
	id serial4 NOT NULL,
	appointment_id int4 NULL,
	image_url text NOT NULL,
	alt_text varchar(255) NULL,
	sort_order int4 DEFAULT 0 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT appointment_images_pkey PRIMARY KEY (id),
	CONSTRAINT appointment_images_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE
);


-- public.chat_sessions definition

-- Drop table

-- DROP TABLE public.chat_sessions;

CREATE TABLE public.chat_sessions (
	id serial4 NOT NULL,
	customer_id int4 NULL,
	session_id varchar(100) NOT NULL,
	status varchar(20) DEFAULT 'active'::character varying NULL,
	agent_id varchar(100) NULL,
	agent_name varchar(100) NULL,
	subject varchar(255) NULL,
	priority varchar(20) DEFAULT 'normal'::character varying NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	closed_at timestamp NULL,
	CONSTRAINT chat_sessions_pkey PRIMARY KEY (id),
	CONSTRAINT chat_sessions_session_id_key UNIQUE (session_id),
	CONSTRAINT chat_sessions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE
);
CREATE INDEX idx_chat_sessions_customer ON public.chat_sessions USING btree (customer_id);
CREATE INDEX idx_chat_sessions_status ON public.chat_sessions USING btree (status);


-- public.customer_activity_log definition

-- Drop table

-- DROP TABLE public.customer_activity_log;

CREATE TABLE public.customer_activity_log (
	id serial4 NOT NULL,
	customer_id int4 NULL,
	activity_type varchar(50) NOT NULL,
	description text NULL,
	points_change int4 DEFAULT 0 NULL,
	transaction_id int4 NULL,
	created_by varchar(255) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT customer_activity_log_pkey PRIMARY KEY (id),
	CONSTRAINT customer_activity_log_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE,
	CONSTRAINT customer_activity_log_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id)
);
CREATE INDEX idx_customer_activity_log_created ON public.customer_activity_log USING btree (created_at);
CREATE INDEX idx_customer_activity_log_customer ON public.customer_activity_log USING btree (customer_id);
CREATE INDEX idx_customer_activity_log_type ON public.customer_activity_log USING btree (activity_type);


-- public.customer_addresses definition

-- Drop table

-- DROP TABLE public.customer_addresses;

CREATE TABLE public.customer_addresses (
	id serial4 NOT NULL,
	customer_id int4 NULL,
	address_type varchar(20) DEFAULT 'shipping'::character varying NULL,
	is_default bool DEFAULT false NULL,
	first_name varchar(100) NOT NULL,
	last_name varchar(100) NOT NULL,
	company varchar(255) NULL,
	address_line1 varchar(255) NOT NULL,
	address_line2 varchar(255) NULL,
	city varchar(100) NOT NULL,
	state varchar(50) NOT NULL,
	zip_code varchar(20) NOT NULL,
	country varchar(100) DEFAULT 'USA'::character varying NULL,
	phone varchar(20) NULL,
	email varchar(255) NULL,
	is_active bool DEFAULT true NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT customer_addresses_pkey PRIMARY KEY (id),
	CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE
);
CREATE INDEX idx_customer_addresses_customer ON public.customer_addresses USING btree (customer_id);
CREATE INDEX idx_customer_addresses_type ON public.customer_addresses USING btree (address_type);


-- public.customer_notification_preferences definition

-- Drop table

-- DROP TABLE public.customer_notification_preferences;

CREATE TABLE public.customer_notification_preferences (
	id serial4 NOT NULL,
	customer_id int4 NULL,
	notification_type varchar(50) NOT NULL,
	category varchar(50) NOT NULL,
	is_enabled bool DEFAULT true NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT customer_notification_prefere_customer_id_notification_type_key UNIQUE (customer_id, notification_type, category),
	CONSTRAINT customer_notification_preferences_pkey PRIMARY KEY (id),
	CONSTRAINT customer_notification_preferences_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE
);
CREATE INDEX idx_customer_notification_preferences_customer ON public.customer_notification_preferences USING btree (customer_id);


-- public.customer_notifications definition

-- Drop table

-- DROP TABLE public.customer_notifications;

CREATE TABLE public.customer_notifications (
	id serial4 NOT NULL,
	customer_id int4 NULL,
	notification_type varchar(50) NOT NULL,
	title varchar(255) NOT NULL,
	message text NOT NULL,
	category varchar(50) NOT NULL,
	is_read bool DEFAULT false NULL,
	action_url text NULL,
	metadata jsonb DEFAULT '{}'::jsonb NULL,
	sent_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	read_at timestamp NULL,
	CONSTRAINT customer_notifications_pkey PRIMARY KEY (id),
	CONSTRAINT customer_notifications_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE
);
CREATE INDEX idx_customer_notifications_customer ON public.customer_notifications USING btree (customer_id);
CREATE INDEX idx_customer_notifications_read ON public.customer_notifications USING btree (is_read);
CREATE INDEX idx_customer_notifications_sent ON public.customer_notifications USING btree (sent_at);


-- public.customer_preferences definition

-- Drop table

-- DROP TABLE public.customer_preferences;

CREATE TABLE public.customer_preferences (
	id serial4 NOT NULL,
	customer_id int4 NULL,
	preference_key varchar(100) NOT NULL,
	preference_value text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT customer_preferences_customer_id_preference_key_key UNIQUE (customer_id, preference_key),
	CONSTRAINT customer_preferences_pkey PRIMARY KEY (id),
	CONSTRAINT customer_preferences_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE
);


-- public.customer_referrals definition

-- Drop table

-- DROP TABLE public.customer_referrals;

CREATE TABLE public.customer_referrals (
	id serial4 NOT NULL,
	referrer_id int4 NULL,
	referred_email varchar(255) NOT NULL,
	referral_code varchar(20) NOT NULL,
	status varchar(20) DEFAULT 'pending'::character varying NULL,
	referrer_points_earned int4 DEFAULT 0 NULL,
	referred_customer_id int4 NULL,
	completed_at timestamp NULL,
	expires_at timestamp DEFAULT CURRENT_DATE + '30 days'::interval NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT customer_referrals_pkey PRIMARY KEY (id),
	CONSTRAINT customer_referrals_referral_code_key UNIQUE (referral_code),
	CONSTRAINT customer_referrals_referred_customer_id_fkey FOREIGN KEY (referred_customer_id) REFERENCES public.customers(id),
	CONSTRAINT customer_referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.customers(id) ON DELETE CASCADE
);
CREATE INDEX idx_customer_referrals_code ON public.customer_referrals USING btree (referral_code);
CREATE INDEX idx_customer_referrals_referrer ON public.customer_referrals USING btree (referrer_id);
CREATE INDEX idx_customer_referrals_status ON public.customer_referrals USING btree (status);


-- public.customer_service_tickets definition

-- Drop table

-- DROP TABLE public.customer_service_tickets;

CREATE TABLE public.customer_service_tickets (
	id serial4 NOT NULL,
	ticket_number varchar(20) NOT NULL,
	customer_id int4 NULL,
	subject varchar(255) NOT NULL,
	description text NOT NULL,
	category varchar(50) NOT NULL,
	priority varchar(20) DEFAULT 'normal'::character varying NULL,
	status varchar(20) DEFAULT 'open'::character varying NULL,
	assigned_to varchar(100) NULL,
	resolution text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	resolved_at timestamp NULL,
	CONSTRAINT customer_service_tickets_pkey PRIMARY KEY (id),
	CONSTRAINT customer_service_tickets_ticket_number_key UNIQUE (ticket_number),
	CONSTRAINT customer_service_tickets_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE
);
CREATE INDEX idx_customer_service_tickets_customer ON public.customer_service_tickets USING btree (customer_id);
CREATE INDEX idx_customer_service_tickets_number ON public.customer_service_tickets USING btree (ticket_number);
CREATE INDEX idx_customer_service_tickets_status ON public.customer_service_tickets USING btree (status);

-- Table Triggers

create trigger trigger_set_ticket_number before
insert
    on
    public.customer_service_tickets for each row execute function set_ticket_number();


-- public.customer_social_accounts definition

-- Drop table

-- DROP TABLE public.customer_social_accounts;

CREATE TABLE public.customer_social_accounts (
	id serial4 NOT NULL,
	customer_id int4 NULL,
	provider varchar(20) NOT NULL,
	provider_user_id varchar(255) NOT NULL,
	email varchar(255) NULL,
	display_name varchar(255) NULL,
	profile_picture_url text NULL,
	access_token text NULL,
	refresh_token text NULL,
	token_expires_at timestamp NULL,
	is_active bool DEFAULT true NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT customer_social_accounts_pkey PRIMARY KEY (id),
	CONSTRAINT customer_social_accounts_provider_provider_user_id_key UNIQUE (provider, provider_user_id),
	CONSTRAINT customer_social_accounts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE
);
CREATE INDEX idx_customer_social_accounts_active ON public.customer_social_accounts USING btree (is_active);
CREATE INDEX idx_customer_social_accounts_customer ON public.customer_social_accounts USING btree (customer_id);
CREATE INDEX idx_customer_social_accounts_provider ON public.customer_social_accounts USING btree (provider);


-- public.customer_wishlists definition

-- Drop table

-- DROP TABLE public.customer_wishlists;

CREATE TABLE public.customer_wishlists (
	id serial4 NOT NULL,
	customer_id int4 NULL,
	product_id int4 NULL,
	added_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	notes text NULL,
	priority int4 DEFAULT 1 NULL,
	CONSTRAINT customer_wishlists_customer_id_product_id_key UNIQUE (customer_id, product_id),
	CONSTRAINT customer_wishlists_pkey PRIMARY KEY (id),
	CONSTRAINT customer_wishlists_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE,
	CONSTRAINT customer_wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);
CREATE INDEX idx_customer_wishlists_customer ON public.customer_wishlists USING btree (customer_id);
CREATE INDEX idx_customer_wishlists_product ON public.customer_wishlists USING btree (product_id);


-- public.location_inventory definition

-- Drop table

-- DROP TABLE public.location_inventory;

CREATE TABLE public.location_inventory (
	id serial4 NOT NULL,
	location_id int4 NULL,
	product_id int4 NULL,
	quantity int4 DEFAULT 0 NOT NULL,
	reserved_quantity int4 DEFAULT 0 NULL,
	reorder_level int4 DEFAULT 5 NULL,
	last_restock_date date NULL,
	notes text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT location_inventory_location_id_product_id_key UNIQUE (location_id, product_id),
	CONSTRAINT location_inventory_pkey PRIMARY KEY (id),
	CONSTRAINT location_inventory_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE,
	CONSTRAINT location_inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);
CREATE INDEX idx_location_inventory_location ON public.location_inventory USING btree (location_id);
CREATE INDEX idx_location_inventory_product ON public.location_inventory USING btree (product_id);


-- public.loyalty_rewards definition

-- Drop table

-- DROP TABLE public.loyalty_rewards;

CREATE TABLE public.loyalty_rewards (
	id serial4 NOT NULL,
	reward_name varchar(255) NOT NULL,
	reward_type varchar(50) NOT NULL,
	points_required int4 NOT NULL,
	discount_percentage numeric(5, 2) NULL,
	discount_amount numeric(10, 2) NULL,
	free_item_product_id int4 NULL,
	description text NULL,
	terms_conditions text NULL,
	is_active bool DEFAULT true NULL,
	valid_from date DEFAULT CURRENT_DATE NULL,
	valid_until date NULL,
	max_redemptions int4 NULL,
	current_redemptions int4 DEFAULT 0 NULL,
	tier_restriction varchar(50) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT loyalty_rewards_pkey PRIMARY KEY (id),
	CONSTRAINT loyalty_rewards_free_item_product_id_fkey FOREIGN KEY (free_item_product_id) REFERENCES public.products(id)
);
CREATE INDEX idx_loyalty_rewards_active ON public.loyalty_rewards USING btree (is_active);
CREATE INDEX idx_loyalty_rewards_type ON public.loyalty_rewards USING btree (reward_type);


-- public.order_status_history definition

-- Drop table

-- DROP TABLE public.order_status_history;

CREATE TABLE public.order_status_history (
	id serial4 NOT NULL,
	transaction_id int4 NULL,
	status varchar(50) NOT NULL,
	status_details text NULL,
	"location" varchar(100) NULL,
	"timestamp" timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by varchar(100) DEFAULT 'system'::character varying NULL,
	CONSTRAINT order_status_history_pkey PRIMARY KEY (id),
	CONSTRAINT order_status_history_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE
);
CREATE INDEX idx_order_status_history_timestamp ON public.order_status_history USING btree ("timestamp");
CREATE INDEX idx_order_status_history_transaction ON public.order_status_history USING btree (transaction_id);


-- public.order_tracking definition

-- Drop table

-- DROP TABLE public.order_tracking;

CREATE TABLE public.order_tracking (
	id serial4 NOT NULL,
	transaction_id int4 NULL,
	tracking_number varchar(100) NULL,
	carrier varchar(50) NULL,
	shipping_method varchar(50) NULL,
	estimated_delivery_date date NULL,
	actual_delivery_date date NULL,
	status varchar(50) DEFAULT 'processing'::character varying NULL,
	shipping_address_id int4 NULL,
	tracking_url text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT order_tracking_pkey PRIMARY KEY (id),
	CONSTRAINT order_tracking_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES public.customer_addresses(id),
	CONSTRAINT order_tracking_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE
);
CREATE INDEX idx_order_tracking_status ON public.order_tracking USING btree (status);
CREATE INDEX idx_order_tracking_transaction ON public.order_tracking USING btree (transaction_id);


-- public.product_features definition

-- Drop table

-- DROP TABLE public.product_features;

CREATE TABLE public.product_features (
	id serial4 NOT NULL,
	product_id int4 NULL,
	feature_name varchar(100) NOT NULL,
	feature_value varchar(255) NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT product_features_pkey PRIMARY KEY (id),
	CONSTRAINT product_features_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);
CREATE INDEX idx_product_features_product_id ON public.product_features USING btree (product_id);


-- public.product_images definition

-- Drop table

-- DROP TABLE public.product_images;

CREATE TABLE public.product_images (
	id serial4 NOT NULL,
	product_id int4 NULL,
	image_url text NOT NULL,
	alt_text varchar(255) NULL,
	is_primary bool DEFAULT false NULL,
	sort_order int4 DEFAULT 0 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT product_images_pkey PRIMARY KEY (id),
	CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);
CREATE INDEX idx_product_images_product_id ON public.product_images USING btree (product_id);


-- public.product_reviews definition

-- Drop table

-- DROP TABLE public.product_reviews;

CREATE TABLE public.product_reviews (
	id serial4 NOT NULL,
	product_id int4 NULL,
	customer_id int4 NULL,
	rating int4 NOT NULL,
	title varchar(255) NULL,
	review_text text NULL,
	is_verified_purchase bool DEFAULT false NULL,
	is_approved bool DEFAULT false NULL,
	helpful_votes int4 DEFAULT 0 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT product_reviews_pkey PRIMARY KEY (id),
	CONSTRAINT product_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
	CONSTRAINT product_reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE,
	CONSTRAINT product_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);
CREATE INDEX idx_product_reviews_approved ON public.product_reviews USING btree (is_approved);
CREATE INDEX idx_product_reviews_customer ON public.product_reviews USING btree (customer_id);
CREATE INDEX idx_product_reviews_product ON public.product_reviews USING btree (product_id);
CREATE INDEX idx_product_reviews_rating ON public.product_reviews USING btree (rating);


-- public.transaction_items definition

-- Drop table

-- DROP TABLE public.transaction_items;

CREATE TABLE public.transaction_items (
	id serial4 NOT NULL,
	transaction_id int4 NULL,
	product_id int4 NULL,
	product_name varchar(255) NOT NULL,
	product_price numeric(10, 2) NOT NULL,
	quantity int4 NOT NULL,
	subtotal numeric(10, 2) NOT NULL,
	CONSTRAINT transaction_items_pkey PRIMARY KEY (id),
	CONSTRAINT transaction_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
	CONSTRAINT transaction_items_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE
);
CREATE INDEX idx_transaction_items_transaction_id ON public.transaction_items USING btree (transaction_id);


-- public.work_order_attachments definition

-- Drop table

-- DROP TABLE public.work_order_attachments;

CREATE TABLE public.work_order_attachments (
	id serial4 NOT NULL,
	work_order_id int4 NULL,
	file_name varchar(255) NOT NULL,
	file_url text NOT NULL,
	file_type varchar(100) NULL,
	file_size int4 NULL,
	uploaded_by int4 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT work_order_attachments_pkey PRIMARY KEY (id),
	CONSTRAINT work_order_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id),
	CONSTRAINT work_order_attachments_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE
);


-- public.work_order_images definition

-- Drop table

-- DROP TABLE public.work_order_images;

CREATE TABLE public.work_order_images (
	id serial4 NOT NULL,
	work_order_id int4 NULL,
	image_url text NOT NULL,
	alt_text varchar(255) NULL,
	sort_order int4 DEFAULT 0 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT work_order_images_pkey PRIMARY KEY (id),
	CONSTRAINT work_order_images_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE
);


-- public.work_order_products definition

-- Drop table

-- DROP TABLE public.work_order_products;

CREATE TABLE public.work_order_products (
	id serial4 NOT NULL,
	work_order_id int4 NULL,
	product_id int4 NULL,
	product_name varchar(255) NOT NULL,
	product_sku varchar(50) NULL,
	serial_number varchar(100) NULL,
	issue_description text NULL,
	resolution text NULL,
	quantity int4 DEFAULT 1 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT work_order_products_pkey PRIMARY KEY (id),
	CONSTRAINT work_order_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
	CONSTRAINT work_order_products_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE
);
CREATE INDEX idx_work_order_products_work_order ON public.work_order_products USING btree (work_order_id);


-- public.work_order_status_history definition

-- Drop table

-- DROP TABLE public.work_order_status_history;

CREATE TABLE public.work_order_status_history (
	id serial4 NOT NULL,
	work_order_id int4 NULL,
	old_status varchar(50) NULL,
	new_status varchar(50) NULL,
	changed_by varchar(255) NULL,
	change_reason text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT work_order_status_history_pkey PRIMARY KEY (id),
	CONSTRAINT work_order_status_history_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE
);


-- public.customer_rewards definition

-- Drop table

-- DROP TABLE public.customer_rewards;

CREATE TABLE public.customer_rewards (
	id serial4 NOT NULL,
	customer_id int4 NULL,
	reward_id int4 NULL,
	points_spent int4 NOT NULL,
	reward_value numeric(10, 2) NOT NULL,
	status varchar(20) DEFAULT 'active'::character varying NULL,
	earned_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	expires_at timestamp NULL,
	used_at timestamp NULL,
	used_in_transaction_id int4 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT customer_rewards_pkey PRIMARY KEY (id),
	CONSTRAINT customer_rewards_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE,
	CONSTRAINT customer_rewards_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES public.loyalty_rewards(id),
	CONSTRAINT customer_rewards_used_in_transaction_id_fkey FOREIGN KEY (used_in_transaction_id) REFERENCES public.transactions(id)
);
CREATE INDEX idx_customer_rewards_customer ON public.customer_rewards USING btree (customer_id);
CREATE INDEX idx_customer_rewards_expires ON public.customer_rewards USING btree (expires_at);
CREATE INDEX idx_customer_rewards_status ON public.customer_rewards USING btree (status);


-- public.product_review_images definition

-- Drop table

-- DROP TABLE public.product_review_images;

CREATE TABLE public.product_review_images (
	id serial4 NOT NULL,
	review_id int4 NULL,
	image_url text NOT NULL,
	alt_text varchar(255) NULL,
	sort_order int4 DEFAULT 0 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT product_review_images_pkey PRIMARY KEY (id),
	CONSTRAINT product_review_images_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.product_reviews(id) ON DELETE CASCADE
);
