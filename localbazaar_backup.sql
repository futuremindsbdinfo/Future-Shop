--
-- PostgreSQL database dump
--

\restrict Y6vMabyy8zBoAWNhtlh9hEPCE77pwbdYeMxsGX1fgSQt3O8WH9MgPW848NMVeu0

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    label character varying(255),
    recipient_name character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    address text NOT NULL,
    division character varying(255),
    district character varying(255),
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.addresses_id_seq OWNER TO postgres;

--
-- Name: addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;


--
-- Name: banners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banners (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    image character varying(255) NOT NULL,
    image_path character varying(255),
    link_url character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.banners OWNER TO postgres;

--
-- Name: banners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banners_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banners_id_seq OWNER TO postgres;

--
-- Name: banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banners_id_seq OWNED BY public.banners.id;


--
-- Name: brand_vendor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brand_vendor (
    id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    brand_id bigint NOT NULL
);


ALTER TABLE public.brand_vendor OWNER TO postgres;

--
-- Name: brand_vendor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.brand_vendor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brand_vendor_id_seq OWNER TO postgres;

--
-- Name: brand_vendor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.brand_vendor_id_seq OWNED BY public.brand_vendor.id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    logo json,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.brands_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brands_id_seq OWNER TO postgres;

--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    parent_id bigint,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    image character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    phase character varying(20) DEFAULT 'mvp'::character varying NOT NULL,
    icon character varying(16)
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: coupon_usages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupon_usages (
    id bigint NOT NULL,
    coupon_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_id bigint NOT NULL,
    discount_amount numeric(12,2) NOT NULL,
    wallet_credited boolean DEFAULT false NOT NULL,
    credited_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.coupon_usages OWNER TO postgres;

--
-- Name: coupon_usages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coupon_usages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupon_usages_id_seq OWNER TO postgres;

--
-- Name: coupon_usages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coupon_usages_id_seq OWNED BY public.coupon_usages.id;


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    description character varying(255),
    discount_percentage smallint NOT NULL,
    usage_limit integer,
    used_count integer DEFAULT 0 NOT NULL,
    is_first_purchase_only boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    wallet_credit_enabled boolean DEFAULT true NOT NULL,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    max_discount_amount numeric(10,2)
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coupons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupons_id_seq OWNER TO postgres;

--
-- Name: coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coupons_id_seq OWNED BY public.coupons.id;


--
-- Name: delivery_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_zones (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    division character varying(255),
    district character varying(255),
    delivery_charge numeric(8,2) DEFAULT '0'::numeric NOT NULL,
    estimated_days_min smallint DEFAULT '1'::smallint NOT NULL,
    estimated_days_max smallint DEFAULT '3'::smallint NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    areas text,
    free_delivery_threshold numeric(12,2)
);


ALTER TABLE public.delivery_zones OWNER TO postgres;

--
-- Name: delivery_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.delivery_zones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.delivery_zones_id_seq OWNER TO postgres;

--
-- Name: delivery_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.delivery_zones_id_seq OWNED BY public.delivery_zones.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    product_name character varying(255) NOT NULL,
    price numeric(12,2) NOT NULL,
    quantity integer NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    commission numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    order_number character varying(255) NOT NULL,
    user_id bigint NOT NULL,
    delivery_zone_id bigint,
    promo_code_id bigint,
    subtotal numeric(12,2) NOT NULL,
    delivery_charge numeric(8,2) DEFAULT '0'::numeric NOT NULL,
    discount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    total numeric(12,2) NOT NULL,
    payment_method character varying(255) DEFAULT 'cod'::character varying NOT NULL,
    payment_status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    order_status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    shipping_name character varying(255) NOT NULL,
    shipping_phone character varying(20) NOT NULL,
    shipping_address text NOT NULL,
    shipping_division character varying(255),
    shipping_district character varying(255),
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    delivery_address json,
    delivery_user_id bigint,
    wallet_used numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    coupon_id bigint,
    payment_code character varying(8),
    online_transaction_id character varying(100),
    delivered_at timestamp(0) without time zone,
    stock_restored_at timestamp(0) without time zone,
    CONSTRAINT orders_order_status_check CHECK (((order_status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'shipped'::character varying, 'delivered'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT orders_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cod'::character varying, 'bkash'::character varying, 'nagad'::character varying, 'rocket'::character varying, 'card'::character varying])::text[]))),
    CONSTRAINT orders_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    category_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    price numeric(12,2) NOT NULL,
    sale_price numeric(12,2),
    sku character varying(255),
    stock_quantity integer DEFAULT 0 NOT NULL,
    images json,
    weight numeric(8,2),
    is_featured boolean DEFAULT false NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    views bigint DEFAULT '0'::bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    cost_price numeric(10,2) DEFAULT '0'::numeric,
    brand_id bigint,
    attributes json,
    CONSTRAINT products_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'out_of_stock'::character varying])::text[])))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: promo_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promo_codes (
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    type character varying(255) DEFAULT 'fixed'::character varying NOT NULL,
    value numeric(12,2) NOT NULL,
    min_order_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    max_discount numeric(12,2),
    usage_limit integer,
    used_count integer DEFAULT 0 NOT NULL,
    starts_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT promo_codes_type_check CHECK (((type)::text = ANY ((ARRAY['fixed'::character varying, 'percentage'::character varying])::text[])))
);


ALTER TABLE public.promo_codes OWNER TO postgres;

--
-- Name: promo_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promo_codes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promo_codes_id_seq OWNER TO postgres;

--
-- Name: promo_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promo_codes_id_seq OWNED BY public.promo_codes.id;


--
-- Name: promotion_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_rules (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    trigger_product_id bigint NOT NULL,
    trigger_quantity smallint DEFAULT '1'::smallint NOT NULL,
    free_product_id bigint NOT NULL,
    free_quantity smallint DEFAULT '1'::smallint NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.promotion_rules OWNER TO postgres;

--
-- Name: promotion_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotion_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promotion_rules_id_seq OWNER TO postgres;

--
-- Name: promotion_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotion_rules_id_seq OWNED BY public.promotion_rules.id;


--
-- Name: q_a_s; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.q_a_s (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    user_id bigint,
    name character varying(255),
    question text NOT NULL,
    answer text,
    is_answered boolean DEFAULT false NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.q_a_s OWNER TO postgres;

--
-- Name: q_a_s_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.q_a_s_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.q_a_s_id_seq OWNER TO postgres;

--
-- Name: q_a_s_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.q_a_s_id_seq OWNED BY public.q_a_s.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    user_id bigint,
    name character varying(255),
    rating integer DEFAULT 5 NOT NULL,
    title character varying(255),
    content text,
    is_verified_purchase boolean DEFAULT false NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    key character varying(255) NOT NULL,
    value text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: social_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_accounts (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    provider character varying(255) NOT NULL,
    provider_id character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.social_accounts OWNER TO postgres;

--
-- Name: social_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.social_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.social_accounts_id_seq OWNER TO postgres;

--
-- Name: social_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.social_accounts_id_seq OWNED BY public.social_accounts.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    vendor_id bigint,
    reference character varying(255) NOT NULL,
    payment_method character varying(255) NOT NULL,
    type character varying(255) DEFAULT 'payment'::character varying NOT NULL,
    amount numeric(12,2) NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    gateway_response json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT transactions_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cod'::character varying, 'bkash'::character varying, 'nagad'::character varying, 'rocket'::character varying, 'card'::character varying])::text[]))),
    CONSTRAINT transactions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT transactions_type_check CHECK (((type)::text = ANY ((ARRAY['payment'::character varying, 'refund'::character varying, 'payout'::character varying])::text[])))
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    email_verified_at timestamp(0) without time zone,
    password character varying(255),
    phone character varying(20),
    avatar character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    role character varying(20) DEFAULT 'customer'::character varying CONSTRAINT users_role_tmp_not_null NOT NULL,
    referral_code character varying(12),
    referred_by_id bigint
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    shop_name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    logo character varying(255),
    banner character varying(255),
    phone character varying(20),
    address character varying(255),
    division character varying(255),
    district character varying(255),
    commission_rate numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    delivery_zone_id bigint,
    proprietor_name character varying(255),
    sr_name character varying(255),
    sr_mobile character varying(20),
    CONSTRAINT vendors_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'suspended'::character varying])::text[])))
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_id_seq OWNER TO postgres;

--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet_transactions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    type character varying(255) NOT NULL,
    amount numeric(12,2) NOT NULL,
    description character varying(255) NOT NULL,
    reference character varying(100),
    balance_after numeric(12,2) NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT wallet_transactions_type_check CHECK (((type)::text = ANY ((ARRAY['credit'::character varying, 'debit'::character varying])::text[])))
);


ALTER TABLE public.wallet_transactions OWNER TO postgres;

--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wallet_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallet_transactions_id_seq OWNER TO postgres;

--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wallet_transactions_id_seq OWNED BY public.wallet_transactions.id;


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallets (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    balance numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.wallets OWNER TO postgres;

--
-- Name: wallets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wallets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallets_id_seq OWNER TO postgres;

--
-- Name: wallets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wallets_id_seq OWNED BY public.wallets.id;


--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlists (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    product_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.wishlists OWNER TO postgres;

--
-- Name: wishlists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wishlists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wishlists_id_seq OWNER TO postgres;

--
-- Name: wishlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wishlists_id_seq OWNED BY public.wishlists.id;


--
-- Name: addresses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);


--
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.banners_id_seq'::regclass);


--
-- Name: brand_vendor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_vendor ALTER COLUMN id SET DEFAULT nextval('public.brand_vendor_id_seq'::regclass);


--
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: coupon_usages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages ALTER COLUMN id SET DEFAULT nextval('public.coupon_usages_id_seq'::regclass);


--
-- Name: coupons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons ALTER COLUMN id SET DEFAULT nextval('public.coupons_id_seq'::regclass);


--
-- Name: delivery_zones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_zones ALTER COLUMN id SET DEFAULT nextval('public.delivery_zones_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: promo_codes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promo_codes ALTER COLUMN id SET DEFAULT nextval('public.promo_codes_id_seq'::regclass);


--
-- Name: promotion_rules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rules ALTER COLUMN id SET DEFAULT nextval('public.promotion_rules_id_seq'::regclass);


--
-- Name: q_a_s id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.q_a_s ALTER COLUMN id SET DEFAULT nextval('public.q_a_s_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: social_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_accounts ALTER COLUMN id SET DEFAULT nextval('public.social_accounts_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Name: wallet_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions ALTER COLUMN id SET DEFAULT nextval('public.wallet_transactions_id_seq'::regclass);


--
-- Name: wallets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets ALTER COLUMN id SET DEFAULT nextval('public.wallets_id_seq'::regclass);


--
-- Name: wishlists id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists ALTER COLUMN id SET DEFAULT nextval('public.wishlists_id_seq'::regclass);


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, user_id, label, recipient_name, phone, address, division, district, is_default, created_at, updated_at) FROM stdin;
1	22	\N	Sadia Iqbal	01254454511	শেরপুর বগুড়া	রাজশাহী	বগুড়া	f	2026-06-25 11:39:40	2026-06-25 11:39:40
\.


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banners (id, title, image, image_path, link_url, is_active, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: brand_vendor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brand_vendor (id, vendor_id, brand_id) FROM stdin;
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, name, slug, logo, description, is_active, created_at, updated_at) FROM stdin;
3	PRAN	pran	{"path":"brands\\/6e709bb3-6d92-4e8f-a4b5-c4bfc8db1542.png","url":"http:\\/\\/localhost:8000\\/storage\\/brands\\/6e709bb3-6d92-4e8f-a4b5-c4bfc8db1542.png","disk":"public"}	Food and beverage	t	2026-06-08 10:50:32	2026-06-23 10:49:36
2	ACI Limited	aci-limited	{"path":"brands\\/c794b7a9-2c8b-4e43-ab37-6bbb3d903d75.png","url":"http:\\/\\/localhost:8000\\/storage\\/brands\\/c794b7a9-2c8b-4e43-ab37-6bbb3d903d75.png","disk":"public"}	Consumer goods and pharmaceuticals	t	2026-06-08 10:50:32	2026-06-23 10:50:22
5	Bashundhara Group	bashundhara-group	{"path":"brands\\/a260df20-9511-43de-a811-f5d19d0c6258.png","url":"http:\\/\\/localhost:8000\\/storage\\/brands\\/a260df20-9511-43de-a811-f5d19d0c6258.png","disk":"public"}	Household and stationery products	t	2026-06-08 10:50:32	2026-06-23 10:51:13
1	Unilever Bangladesh	unilever-bangladesh	{"path":"brands\\/e890597d-db39-43be-8fa5-f58a41220cfe.png","url":"http:\\/\\/localhost:8000\\/storage\\/brands\\/e890597d-db39-43be-8fa5-f58a41220cfe.png","disk":"public"}	Personal care and food products	t	2026-06-08 10:50:32	2026-06-23 10:53:18
7	Akij Group	akij-group	{"path":"brands\\/257cc9db-79ae-4f73-96b2-0509e8ca0c4b.png","url":"http:\\/\\/localhost:8000\\/storage\\/brands\\/257cc9db-79ae-4f73-96b2-0509e8ca0c4b.png","disk":"public"}	\N	t	2026-06-23 10:53:53	2026-06-23 10:53:53
8	Abul Khair Group	abul-khair-group	{"path":"brands\\/6263508b-c589-4a55-8472-0884f896efc6.png","url":"http:\\/\\/localhost:8000\\/storage\\/brands\\/6263508b-c589-4a55-8472-0884f896efc6.png","disk":"public"}	\N	t	2026-06-23 10:54:16	2026-06-23 10:54:16
9	ACME	acme	{"path":"brands\\/81ea63d7-c441-4a97-9729-c2b740eaabe6.png","url":"http:\\/\\/localhost:8000\\/storage\\/brands\\/81ea63d7-c441-4a97-9729-c2b740eaabe6.png","disk":"public"}	\N	t	2026-06-23 11:43:08	2026-06-23 11:43:08
10	Square Group	square-group	{"path":"brands\\/5ebae481-1393-48c6-a37d-dd4fef4e7156.png","url":"http:\\/\\/localhost:8000\\/storage\\/brands\\/5ebae481-1393-48c6-a37d-dd4fef4e7156.png","disk":"public"}	\N	t	2026-06-23 11:45:36	2026-06-23 11:45:36
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
future-shop-cache-5c785c036466adea360111aa28563bfd556b5fba:timer	i:1783939906;	1783939906
future-shop-cache-5c785c036466adea360111aa28563bfd556b5fba	i:1;	1783939906
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, parent_id, name, slug, image, is_active, sort_order, created_at, updated_at, phase, icon) FROM stdin;
61	\N	Tissue Box	tissue-box	\N	t	0	2026-06-20 12:50:25	2026-06-20 12:56:26	mvp	fa-box-tissue
63	61	Pocket Tissue	pocket-tissue	\N	t	0	2026-06-20 12:59:30	2026-06-20 12:59:41	mvp	\N
64	\N	Basundhara	basundhara	\N	t	0	2026-07-29 07:02:03	2026-07-29 07:02:03	mvp	\N
65	\N	Aci	aci	\N	t	0	2026-07-29 07:02:05	2026-07-29 07:02:05	mvp	\N
66	\N	Mustard Oil	mustard-oil	\N	t	0	2026-07-29 07:12:40	2026-07-29 07:12:40	mvp	\N
67	\N	Atta, Moida	atta-moida	\N	t	0	2026-07-29 07:12:41	2026-07-29 07:12:41	mvp	\N
68	\N	Chal	chal	\N	t	0	2026-07-29 07:12:41	2026-07-29 07:12:41	mvp	\N
70	\N	Atta & Moida	atta-moida-1	\N	t	0	2026-07-29 08:49:03	2026-07-29 08:49:03	mvp	\N
71	\N	Dairy	dairy	\N	t	0	2026-07-29 08:49:03	2026-07-29 08:49:03	mvp	\N
72	\N	Detergent Powder	detergent-powder	\N	t	0	2026-07-29 08:49:03	2026-07-29 08:49:03	mvp	\N
73	\N	Napkin	napkin	\N	t	0	2026-07-29 08:49:04	2026-07-29 08:49:04	mvp	\N
74	\N	Salaine	salaine	\N	t	0	2026-07-29 08:49:04	2026-07-29 08:49:04	mvp	\N
75	\N	Salt	salt	\N	t	0	2026-07-29 08:49:04	2026-07-29 08:49:04	mvp	\N
76	\N	Soyabin Oil	soyabin-oil	\N	t	0	2026-07-29 08:49:04	2026-07-29 08:49:04	mvp	\N
77	\N	Suji	suji	\N	t	0	2026-07-29 08:49:04	2026-07-29 08:49:04	mvp	\N
78	\N	Sunflower Oil	sunflower-oil	\N	t	0	2026-07-29 08:49:04	2026-07-29 08:49:04	mvp	\N
41	\N	Grocery & Drinks	grocery-drinks	\N	t	1	2026-05-30 15:46:44	2026-05-30 15:54:52	mvp	fa-cart-shopping
42	\N	Livestock & Agriculture	livestock-agriculture	\N	t	2	2026-05-30 15:46:44	2026-05-30 15:54:52	mvp	fa-cow
43	\N	Medicine & Health	medicine-health	\N	t	3	2026-05-30 15:46:44	2026-05-30 15:54:52	mvp	fa-pills
44	\N	Health & Personal Care	health-personal-care	\N	f	4	2026-05-30 15:46:44	2026-05-30 15:54:52	phase2	fa-heart-pulse
45	\N	Fashion & Beauty	fashion-beauty	\N	f	5	2026-05-30 15:46:44	2026-05-30 15:54:52	phase2	fa-shirt
46	\N	Devices & Electronics	devices-electronics	\N	f	6	2026-05-30 15:46:44	2026-05-30 15:54:52	phase2	fa-laptop
47	\N	Mobile Accessories	mobile-accessories	\N	f	7	2026-05-30 15:46:44	2026-05-30 15:54:52	phase2	fa-mobile-screen
48	\N	Home & DIY	home-diy	\N	f	8	2026-05-30 15:46:44	2026-05-30 15:54:52	phase3	fa-house
49	\N	Toys, Children & Baby	toys-children-baby	\N	f	9	2026-05-30 15:46:44	2026-05-30 15:54:52	phase3	fa-baby
50	\N	Books & Reading	books-reading	\N	f	10	2026-05-30 15:46:44	2026-05-30 15:54:52	phase3	fa-book-open
51	\N	Gifting	gifting	\N	f	11	2026-05-30 15:46:44	2026-05-30 15:54:52	phase3	fa-gift
52	\N	Deals & Savings	deals-savings	\N	f	12	2026-05-30 15:46:44	2026-05-30 15:54:52	phase2	fa-tag
53	\N	Spotlight Stories	spotlight-stories	\N	f	13	2026-05-30 15:46:44	2026-05-30 15:54:52	phase3	fa-star
54	\N	Automotive	automotive	\N	f	14	2026-05-30 15:46:44	2026-05-30 15:54:52	phase4	fa-car
55	\N	Office & Personal	office-personal	\N	f	15	2026-05-30 15:46:44	2026-05-30 15:54:52	phase3	fa-briefcase
56	\N	Luggage & Travel Gear	luggage-travel-gear	\N	f	16	2026-05-30 15:46:44	2026-05-30 15:54:52	phase4	fa-suitcase
57	\N	Sustainability	sustainability	\N	f	17	2026-05-30 15:46:44	2026-05-30 15:54:52	phase4	fa-leaf
58	\N	Food & Restaurant	food-restaurant	\N	f	18	2026-05-30 15:46:44	2026-05-30 15:54:52	phase4	fa-utensils
59	\N	Sports & Fitness	sports-fitness	\N	f	19	2026-05-30 15:46:44	2026-05-30 15:54:52	phase4	fa-dumbbell
60	\N	Services	services	\N	f	20	2026-05-30 15:46:44	2026-05-30 15:54:52	phase5	fa-wrench
\.


--
-- Data for Name: coupon_usages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon_usages (id, coupon_id, user_id, order_id, discount_amount, wallet_credited, credited_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, description, discount_percentage, usage_limit, used_count, is_first_purchase_only, is_active, wallet_credit_enabled, expires_at, created_at, updated_at, max_discount_amount) FROM stdin;
1	MAX50	\N	50	\N	0	t	t	t	\N	2026-07-13 08:05:26	2026-07-13 08:05:26	500.00
\.


--
-- Data for Name: delivery_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_zones (id, name, division, district, delivery_charge, estimated_days_min, estimated_days_max, is_active, created_at, updated_at, areas, free_delivery_threshold) FROM stdin;
1	Zone A — Sherpur	\N	\N	50.00	1	2	t	2026-05-30 05:56:21	2026-06-03 04:33:37	\N	\N
2	Zone B — Bogura Sadar & Nearby upazilas (within 15km)	\N	\N	80.00	2	3	t	2026-05-30 05:56:21	2026-06-03 04:34:02	\N	\N
3	Zone C — Outer areas (15–30km)	\N	\N	120.00	3	5	f	2026-05-30 05:56:21	2026-06-03 05:12:20	\N	\N
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2026_05_30_100001_create_delivery_zones_table	1
5	2026_05_30_100002_create_vendors_table	1
6	2026_05_30_100003_create_categories_table	1
7	2026_05_30_100004_create_products_table	1
8	2026_05_30_100005_create_orders_table	1
9	2026_05_30_100006_create_order_items_table	1
10	2026_05_30_100007_create_transactions_table	1
11	2026_05_30_100008_create_promo_codes_table	1
12	2026_05_30_055708_create_personal_access_tokens_table	2
13	2026_05_30_110001_add_delivery_to_users_role_enum	3
14	2026_05_30_110002_add_soft_deletes_to_products_table	3
15	2026_05_30_120001_add_delivery_zone_id_to_vendors_table	4
16	2026_05_30_130001_add_delivery_address_snapshot_to_orders_table	5
17	2026_05_30_140001_add_phase_to_categories_table	6
18	2026_05_30_150001_make_users_email_password_nullable	7
19	2026_05_30_160001_add_icon_to_categories_table	8
20	2026_05_30_170001_add_areas_and_threshold_to_delivery_zones	9
21	2026_05_30_170002_create_banners_table	9
22	2026_05_30_170003_create_settings_table	9
23	2026_05_30_170004_create_addresses_table	9
24	2026_05_30_170005_add_delivery_user_id_to_orders	9
25	2026_06_01_100001_add_cost_price_to_products_table	10
26	2026_06_08_104803_create_brands_table	11
27	2026_06_08_104810_add_brand_id_to_products_table	11
28	2026_06_08_160628_create_wishlists_table	12
29	2026_06_08_160708_create_wallets_table	12
30	2026_06_08_170448_add_referral_fields_to_users_table	13
31	2026_06_08_170449_create_wallet_transactions_table	13
32	2026_06_08_170450_create_coupons_table	14
33	2026_06_08_170450b_create_coupon_usages_table	14
34	2026_06_08_170451_create_promotion_rules_table	14
35	2026_06_08_170452_add_wallet_used_and_coupon_id_to_orders_table	14
36	2026_06_09_092958_add_payment_fields_to_orders_table	15
37	2026_06_20_100001_add_attributes_to_products_table	16
38	2026_06_21_100001_add_dealer_fields_to_vendors_table	17
39	2026_06_22_100001_create_brand_vendor_table	18
40	2026_06_25_081418_create_social_accounts_table	19
41	2026_06_28_120327_add_delivered_at_to_orders_table	20
42	2026_06_30_081141_create_reviews_table	21
43	2026_06_30_081142_create_q_a_s_table	21
44	2026_07_02_090000_add_stock_restored_at_to_orders_table	22
45	2026_07_13_080120_add_max_discount_amount_to_coupons_table	23
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, vendor_id, product_name, price, quantity, subtotal, commission, created_at, updated_at) FROM stdin;
2	4	25	6	ডিজিটাল থার্মোমিটার	350.00	1	350.00	35.00	2026-06-03 04:57:23	2026-06-03 04:57:23
3	5	54	6	Acme Mustard Oil - 80ml	35.00	1	35.00	0.00	2026-06-27 05:41:32	2026-06-27 05:41:32
4	6	52	6	PRAN Mughal Mustard Oil - 150 ml	55.00	1	55.00	0.00	2026-06-28 06:15:34	2026-06-28 06:15:34
5	6	51	6	PRAN Mughal Mustard Oil - 90 ml	35.00	1	35.00	0.00	2026-06-28 06:15:34	2026-06-28 06:15:34
6	6	50	6	PRAN Mustard Oil - 5 Liter	1400.00	1	1400.00	0.00	2026-06-28 06:15:34	2026-06-28 06:15:34
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, user_id, delivery_zone_id, promo_code_id, subtotal, delivery_charge, discount, total, payment_method, payment_status, order_status, shipping_name, shipping_phone, shipping_address, shipping_division, shipping_district, notes, created_at, updated_at, delivery_address, delivery_user_id, wallet_used, coupon_id, payment_code, online_transaction_id, delivered_at, stock_restored_at) FROM stdin;
5	FS-2026-00005	23	1	\N	35.00	50.00	0.00	85.00	cod	pending	cancelled	Ashraful Alam Ashik	+8801723-805798	Kharna, Shajahanpur	\N	\N	\N	2026-06-27 05:41:32	2026-07-04 03:47:49	{"name":"Ashraful Alam Ashik","phone":"+8801723-805798","address":"Kharna, Shajahanpur","division":null,"district":null,"zone":"Zone A \\u2014 Sherpur","snapshot_at":"2026-06-27T05:41:32+00:00"}	13	0.00	\N	573684	\N	\N	2026-07-04 03:47:49
4	FS-2026-00004	1	1	\N	350.00	50.00	0.00	400.00	bkash	paid	delivered	Md Ashraful Alam Ashik	+8801737940250	Rajshahi - Bogra Hwy	\N	\N	\N	2026-06-03 04:57:23	2026-06-23 11:59:17	{"name":"Md Ashraful Alam Ashik","phone":"+8801737940250","address":"Rajshahi - Bogra Hwy","division":null,"district":null,"zone":"Zone A \\u2014 Sherpur","snapshot_at":"2026-06-03T04:57:23+00:00"}	13	0.00	\N	\N	\N	\N	\N
6	FS-2026-00006	13	1	\N	1490.00	50.00	0.00	1540.00	cod	paid	delivered	Al Amin Khan Tirtho	01337354142	Sannalpara, Behind Sonali bank Bus-stand, Sherpur, Bogura, Bogura, Bangladesh, 5840	\N	\N	\N	2026-06-28 06:15:34	2026-06-28 06:19:02	{"name":"Al Amin Khan Tirtho","phone":"01337354142","address":"Sannalpara, Behind Sonali bank Bus-stand, Sherpur, Bogura, Bogura, Bangladesh, 5840","division":null,"district":null,"zone":"Zone A \\u2014 Sherpur","snapshot_at":"2026-06-28T06:15:34+00:00"}	13	0.00	\N	685562	\N	\N	\N
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
1	App\\Models\\User	1	api	3ab187d278888719d8409ab3007953e92d7979b4da6955677f2103c033fefdba	["*"]	\N	\N	2026-05-30 06:01:05	2026-05-30 06:01:05
2	App\\Models\\User	1	api	62b2655456529fcabb8b177639147df42c461b54dff9a9cbe301096674e9e9a5	["*"]	2026-05-30 06:01:20	\N	2026-05-30 06:01:19	2026-05-30 06:01:20
37	App\\Models\\User	1	api	2e06cccdf45e482b4794a16eb384a8f336ba857f90a21622027c1fb7d9bd61b5	["*"]	2026-06-06 07:12:14	\N	2026-06-06 07:11:51	2026-06-06 07:12:14
3	App\\Models\\User	1	api	3051d9b76c7f38e2e4250e82633a7035a0d7fd0905e613f0923c669aeb20cc10	["*"]	2026-05-30 06:08:44	\N	2026-05-30 06:08:42	2026-05-30 06:08:44
4	App\\Models\\User	4	api	46cf3acd6193e5e644d0f0b943ec20ecd889c790ccb8acdbc01da8459f67c1b8	["*"]	2026-05-30 06:08:45	\N	2026-05-30 06:08:45	2026-05-30 06:08:45
29	App\\Models\\User	1	api	d86e348a2634bf7c5b2e25427e20a9fa4442fa19f360649f81488d5e70a202e0	["*"]	2026-06-04 11:04:18	\N	2026-06-04 09:18:55	2026-06-04 11:04:18
5	App\\Models\\User	1	api	a50e4cb97c6722db20ddd11d328348bf8bed6ac91acec7423392a2d365554fea	["*"]	2026-05-30 06:12:02	\N	2026-05-30 06:12:00	2026-05-30 06:12:02
6	App\\Models\\User	1	api	c7a5d740534907cbc800fb126b0d613bfe6bbb8e84d66703eac5e6aefb4ae241	["*"]	2026-05-30 06:12:53	\N	2026-05-30 06:12:51	2026-05-30 06:12:53
7	App\\Models\\User	5	api	fc3b4cb741a59a79f40aa36786dbebc3128f595c41716afd836648fa79552209	["*"]	2026-05-30 06:12:54	\N	2026-05-30 06:12:54	2026-05-30 06:12:54
35	App\\Models\\User	1	api	ad67540e0f3a5cc339b618dab385ee43f8aa47f30a8932f88baf789d8a66449d	["*"]	2026-06-06 08:43:23	\N	2026-06-06 07:06:15	2026-06-06 08:43:23
8	App\\Models\\User	7	api	21f9379430e3bde3dca42c949d5789d9ac2c53d4f55f44391bac2731c783cc16	["*"]	2026-05-30 06:17:13	\N	2026-05-30 06:17:11	2026-05-30 06:17:13
36	App\\Models\\User	1	api	5ff894d268126dffcfa823ab8b54d149192784710cfda400ba1b3410fbc15b1d	["*"]	2026-06-06 07:08:31	\N	2026-06-06 07:08:29	2026-06-06 07:08:31
24	App\\Models\\User	1	api	25209262831244b3648c1990d669e81bb2f10b938f4b9b734f40495b64355151	["*"]	2026-06-03 11:39:56	\N	2026-06-03 11:39:31	2026-06-03 11:39:56
18	App\\Models\\User	1	api	c306a9b8c9928391065b1e8a20b4f3215ac93095ddf7879f256054079b88be37	["*"]	2026-06-03 04:57:39	\N	2026-06-03 04:35:52	2026-06-03 04:57:39
10	App\\Models\\User	8	api	7e0aa1543b7d087ee7bc0e54ce0e6327dacb421f6565ef6b055afcead8cb4924	["*"]	2026-05-30 06:19:36	\N	2026-05-30 06:19:35	2026-05-30 06:19:36
9	App\\Models\\User	7	api	3f10d118af6646142d004d89e8cfb887dbf9312bcb429eebef71293bd2f008a4	["*"]	2026-05-30 06:19:36	\N	2026-05-30 06:19:31	2026-05-30 06:19:36
11	App\\Models\\User	7	api	6a313d6724ecc2cf7745cbdcb042b106f4f609a0f11d74304b07a366d1a9d011	["*"]	2026-05-30 06:23:41	\N	2026-05-30 06:23:37	2026-05-30 06:23:41
12	App\\Models\\User	10	api	1cad540cc37573fec0c7bab7ca68bb468f9ef0ecc206aa0486ae50a07737dc3b	["*"]	\N	\N	2026-05-30 11:36:39	2026-05-30 11:36:39
13	App\\Models\\User	11	api	73ee6e46654cde5b8c23f835c51c4f32f8680f92e0346e22e553257cfcd9f51b	["*"]	\N	\N	2026-05-30 11:37:32	2026-05-30 11:37:32
14	App\\Models\\User	1	api	ba12a0df6832f52bd1ffcdebfb2a511e3fc94131fb2461d5c88cc774fe332cda	["*"]	2026-05-30 16:11:43	\N	2026-05-30 16:11:42	2026-05-30 16:11:43
30	App\\Models\\User	1	api	980dca071dfb7a340e9b9f681608e801a3121712bdb25bf44486dacc0cb7de94	["*"]	2026-06-04 15:11:03	\N	2026-06-04 15:10:54	2026-06-04 15:11:03
15	App\\Models\\User	1	api	434898f90e762205003def2c1be5b4b550a3b811996cd46727a7095d614e30c9	["*"]	2026-06-02 11:21:14	\N	2026-06-02 11:21:12	2026-06-02 11:21:14
27	App\\Models\\User	1	api	dc74ab42c6115f97066b6fbd4b91d4e76d71045e1744a7c2fc92fe5b3c9621b5	["*"]	2026-06-04 04:19:23	\N	2026-06-04 04:15:00	2026-06-04 04:19:23
16	App\\Models\\User	1	api	75eae2855f2b418a7fd57feae03008dc585baa2bcc918d07415a956cad689bde	["*"]	2026-06-03 04:30:10	\N	2026-06-03 04:26:18	2026-06-03 04:30:10
25	App\\Models\\User	1	api	5f1773e9e733e4d6fbfd99e419ea36558fa19d8d87fba0d9dcef65c42f4a7c95	["*"]	2026-06-04 04:14:20	\N	2026-06-04 04:14:12	2026-06-04 04:14:20
21	App\\Models\\User	1	api	fe2043ed25b71b13e75fb8541db9432ed6607b19b70b8143927cc9dda6f6520c	["*"]	2026-06-03 05:17:44	\N	2026-06-03 05:11:28	2026-06-03 05:17:44
23	App\\Models\\User	1	api	68eb73b39c3875979ae5eea79c1ad92414ced58588eed0984698832bc22e8061	["*"]	2026-06-03 10:16:31	\N	2026-06-03 09:53:17	2026-06-03 10:16:31
20	App\\Models\\User	1	api	88d7785464cffda2624433145f7e1453058475316ecb4f9158fbc0180be7dc72	["*"]	2026-06-03 04:58:05	\N	2026-06-03 04:57:40	2026-06-03 04:58:05
22	App\\Models\\User	1	api	0106a2f6dab420407e10e7450159799326a023d68cc335d2f30e9d8068f841af	["*"]	2026-06-03 09:52:38	\N	2026-06-03 09:39:55	2026-06-03 09:52:38
19	App\\Models\\User	1	api	e3adfaab64a22728a2386534f90b14689f3b9690d68ac09d1d5eae9f44d252b4	["*"]	2026-06-03 04:58:12	\N	2026-06-03 04:56:29	2026-06-03 04:58:12
17	App\\Models\\User	1	api	e3c80f5722f374b0291faca4d8599107f22aa43a51a7da7c3e08d03784560348	["*"]	2026-06-03 04:35:51	\N	2026-06-03 04:32:36	2026-06-03 04:35:51
33	App\\Models\\User	1	api	674797a85bb25d6f87024313f6900a548486f4fcf2df318e5a75060b524c9174	["*"]	2026-06-05 17:31:06	\N	2026-06-05 17:24:32	2026-06-05 17:31:06
26	App\\Models\\User	1	api	4db73fbb10429713aaa9f8c6be1725b46f8a7adf7aefb41b277408f88f09a7ac	["*"]	2026-06-04 04:14:36	\N	2026-06-04 04:14:23	2026-06-04 04:14:36
28	App\\Models\\User	1	api	885d55d7cd7b1dbd6f9c04fdede095a1ad1688998daefafec63d20b47ab0739a	["*"]	2026-06-04 04:23:04	\N	2026-06-04 04:22:36	2026-06-04 04:23:04
31	App\\Models\\User	1	api	f4457cec60b34e662e5515ecc9b79a2e31ab7f8c9e1013b2d656c51f3ffa124b	["*"]	2026-06-04 15:42:26	\N	2026-06-04 15:15:49	2026-06-04 15:42:26
32	App\\Models\\User	1	api	ff5f2bd2d37b640ce9b5c23b56b7156b17ee644cf82ad8e91f2abec1ebe85a84	["*"]	2026-06-05 17:19:19	\N	2026-06-05 17:19:18	2026-06-05 17:19:19
40	App\\Models\\User	1	api	4c23f026c82885ea81b468c489f2c42a15492e9a0391bb4e35bfeba4de17b8ae	["*"]	\N	\N	2026-06-09 06:50:19	2026-06-09 06:50:19
34	App\\Models\\User	1	api	603f559d4295d645a5d419e7b02dff8fca3139925d1a0bce02afe7f6f5c2fd3e	["*"]	2026-06-06 00:40:17	\N	2026-06-06 00:40:15	2026-06-06 00:40:17
41	App\\Models\\User	1	api	30b170955d56896b71bc06314d2726b40119352447b99b4cd2c9b7dc5b7939a0	["*"]	2026-06-09 09:12:29	\N	2026-06-09 06:50:40	2026-06-09 09:12:29
38	App\\Models\\User	1	api	657f4c7766f0a6e2df1952a4f5fe33a221bf948b9e6da7074777a7f518de964b	["*"]	2026-06-06 07:13:36	\N	2026-06-06 07:12:02	2026-06-06 07:13:36
39	App\\Models\\User	1	api	1850efd48f6bd505901fd7fc8b98cb5aa2858c7beb2ac760df77b39dc50ec7d0	["*"]	2026-06-08 11:05:24	\N	2026-06-08 11:04:55	2026-06-08 11:05:24
44	App\\Models\\User	1	api	30f80448e51ae80f0815d05e38c8c6d4fcd29e2b56c70deb15d75405c072858e	["*"]	2026-06-11 10:56:53	\N	2026-06-11 10:56:46	2026-06-11 10:56:53
51	App\\Models\\User	1	api	c7c024a326d04933a86aa423db6f44239df36c398e291b1751aea1ac0cef8c41	["*"]	2026-06-13 10:21:54	\N	2026-06-13 06:39:19	2026-06-13 10:21:54
45	App\\Models\\User	15	api	787d813aed74b5a84b585e6d9db832d1510d72c67f00a923844afc3377e2d534	["*"]	2026-06-11 14:35:16	\N	2026-06-11 14:34:53	2026-06-11 14:35:16
52	App\\Models\\User	1	api	177cde394ce1beb3c6101c24dbab2303f03ac5bd02b1588ba2035e9f1951ae17	["*"]	2026-06-13 09:40:00	\N	2026-06-13 08:37:31	2026-06-13 09:40:00
93	App\\Models\\User	1	api	ff1d12113fe4f51c14609d36e95e2bbfbacdcf39dcf92cb32ae4043ffedbdf4c	["*"]	2026-07-04 04:59:11	\N	2026-07-04 04:54:41	2026-07-04 04:59:11
64	App\\Models\\User	1	api	f658817a43eae6f8cfe028405c71460ba897d7d0bbfd5716f0b64fbd2f916a00	["*"]	2026-06-23 11:59:18	\N	2026-06-23 11:58:40	2026-06-23 11:59:18
58	App\\Models\\User	1	api	e70637bbe98d54aca57e5af043af4d8d9aba62667a70be0e1fd501a1ce776bab	["*"]	2026-06-21 06:19:07	\N	2026-06-21 06:17:47	2026-06-21 06:19:07
61	App\\Models\\User	1	api	3e30b2d0118b60231ef106a3a68cac025953f956d9a7988d1122403de33c9253	["*"]	2026-06-21 14:05:06	\N	2026-06-21 13:58:56	2026-06-21 14:05:06
87	App\\Models\\User	1	api	53e809799a44495d2189746a1c0a63ef5b59aed91e2843421668540d5b44aefc	["*"]	2026-07-01 09:16:21	\N	2026-07-01 08:51:18	2026-07-01 09:16:21
59	App\\Models\\User	1	api	47045596f5b41e3634c841ae48483f207aa2b106c0d6b63e1c48894301bb5390	["*"]	2026-06-21 10:19:24	\N	2026-06-21 10:19:07	2026-06-21 10:19:24
82	App\\Models\\User	13	api	097523f8aaed374a6b8c8e7cacea80d33f36f2cda81d635f29dafb8f85c57544	["*"]	2026-06-28 12:44:35	\N	2026-06-28 12:13:54	2026-06-28 12:44:35
62	App\\Models\\User	1	api	fe9b785df385c9b77283e1a1e48263ab3c4aebab6c6d0d45cc32a4338e3e8dbf	["*"]	2026-06-22 12:10:25	\N	2026-06-22 05:03:33	2026-06-22 12:10:25
54	App\\Models\\User	1	api	ea6f828b3e290a685b5e91f69aedb347a5bd527d51946841d2d53bd2dcd0c53d	["*"]	2026-06-17 13:27:40	\N	2026-06-17 13:26:48	2026-06-17 13:27:40
65	App\\Models\\User	1	api	94178ab46d005c3c220e4dd2310ced36585f83af713d516afdb44f6f2e8428aa	["*"]	2026-06-25 06:15:47	\N	2026-06-25 05:21:58	2026-06-25 06:15:47
60	App\\Models\\User	1	api	1fb98b6d0052ec968db731be3033285eddf1e69c4b4a11a84007177d61317cec	["*"]	2026-06-21 14:26:53	\N	2026-06-21 13:45:09	2026-06-21 14:26:53
83	App\\Models\\User	13	api	dffcf635258119de608f7ed69cc0a587ef49016d8155302762a6f983c2c36374	["*"]	\N	\N	2026-06-30 08:01:14	2026-06-30 08:01:14
56	App\\Models\\User	18	api	86c82e3fe1e7a0a701fb0faf048ca6bcfabf937e0cd9067ea154d58809194aa2	["*"]	2026-06-18 12:33:56	\N	2026-06-18 12:33:40	2026-06-18 12:33:56
71	App\\Models\\User	1	api	a3411855ec31b0051865074150d825f815392df15fa051cc18304c70cd1c7557	["*"]	2026-06-25 11:42:54	\N	2026-06-25 11:42:45	2026-06-25 11:42:54
53	App\\Models\\User	1	api	9f171b6828dfcfd8e49a5b5bdb1da40ee8a5b50ec5cefe620e66941e5bc607fa	["*"]	2026-06-16 07:51:14	\N	2026-06-16 06:22:35	2026-06-16 07:51:14
108	App\\Models\\User	13	api	56801d7d5d7ad86c3e17dd22495c88630a477cb2c2eabcd33be28a13636d0e1e	["*"]	2026-07-05 09:42:16	\N	2026-07-05 09:42:07	2026-07-05 09:42:16
72	App\\Models\\User	1	api	6f218e4ea09ff002927e358596b6830c1005058e7fabbf6e04456e7fbabe3652	["*"]	2026-06-25 11:57:38	\N	2026-06-25 11:57:32	2026-06-25 11:57:38
55	App\\Models\\User	1	api	f027f6bdedc3c6cc41254cc561b45b2f4386a1893e7e7a9e406ae0859c638196	["*"]	2026-06-18 12:35:06	\N	2026-06-18 12:32:31	2026-06-18 12:35:06
85	App\\Models\\User	1	api	ea8a85f2435657ac07481d0098c0681a23a7f8a0fdf3933ff15b7bd26407e6f9	["*"]	2026-07-01 05:39:18	\N	2026-07-01 05:37:58	2026-07-01 05:39:18
57	App\\Models\\User	1	api	8eef87ef48b3980870119ee3b4bfad789248f0315227b5021bfac53363ff4afd	["*"]	2026-06-20 12:59:47	\N	2026-06-20 10:35:40	2026-06-20 12:59:47
79	App\\Models\\User	13	api	19a1c70e731d35d882080878a990820595f3cb2087fcbc3a0593c413e29b5f21	["*"]	\N	\N	2026-06-28 11:58:50	2026-06-28 11:58:50
63	App\\Models\\User	1	api	cb9710a373c29d00ebc6acc99c227a47650ae64709d87f4d55ff99ccbb726d8c	["*"]	2026-06-23 11:56:57	\N	2026-06-23 05:55:13	2026-06-23 11:56:57
106	App\\Models\\User	13	api	9c0180caef4321393a8efe74bb55f80931a46733ea8c23be6a4d516e45a3ae07	["*"]	2026-07-05 09:09:46	\N	2026-07-05 09:07:36	2026-07-05 09:09:46
73	App\\Models\\User	23	api	d4a615ba803c736cddcbb9e10e30b54fdf35121d4b42359a572669621c695059	["*"]	2026-06-27 05:43:49	\N	2026-06-27 05:40:23	2026-06-27 05:43:49
68	App\\Models\\User	21	api	bf263995bf361b2c0ab4055689e7aa8a32ae68078877d410374b08e4729bf19b	["*"]	2026-06-25 08:10:13	\N	2026-06-25 08:10:12	2026-06-25 08:10:13
104	App\\Models\\User	1	api	9b946c67f9c387b7e89c1104ec74c01639842000c4490325d0a42218770b6aab	["*"]	2026-07-05 09:03:20	\N	2026-07-05 08:56:47	2026-07-05 09:03:20
88	App\\Models\\User	1	api	3df94e19136ba7790893aa44b00d569efbe22589810bb2e331b69085236a052e	["*"]	2026-07-02 10:12:33	\N	2026-07-02 10:12:10	2026-07-02 10:12:33
96	App\\Models\\User	27	api	035e540b540cb910eb63126c5f1bb82dcb89606381e84551a5385480fd498563	["*"]	\N	\N	2026-07-04 05:01:35	2026-07-04 05:01:35
74	App\\Models\\User	1	api	930416c847dd3973b983d476c9f1de17c3d988a1426ec10054afba51081ed5c9	["*"]	2026-06-27 07:22:49	\N	2026-06-27 06:58:17	2026-06-27 07:22:49
84	App\\Models\\User	1	api	f8616272c6c69a72cd57e11890ccd21ad09c56d52ff87d275856fd2b0b78e8b5	["*"]	2026-06-30 09:24:51	\N	2026-06-30 08:01:19	2026-06-30 09:24:51
94	App\\Models\\User	26	api	73496f15f22d9bedb12ea316540db9a3ff8edb0291d800d8990be81cead23047	["*"]	2026-07-04 05:03:57	\N	2026-07-04 04:56:01	2026-07-04 05:03:57
86	App\\Models\\User	1	api	93000d440c829a2d5f14b716147f1794384923e321fc2517b3f5266f7f164671	["*"]	2026-07-01 06:35:08	\N	2026-07-01 06:15:52	2026-07-01 06:35:08
100	App\\Models\\User	1	api	9e352f77bb07f683c8524522f66905a21d44549b4ea6c0d043c86ab7539726b6	["*"]	2026-07-04 09:56:06	\N	2026-07-04 09:23:08	2026-07-04 09:56:06
103	App\\Models\\User	27	api	247af22051c8884fad44c22d0615a36b753a54f6cd2abb6f15911ce4dd7002cd	["*"]	2026-07-05 05:02:19	\N	2026-07-05 04:50:57	2026-07-05 05:02:19
115	App\\Models\\User	1	api	469919bfe14b728c01c9282ea5704dfa261ba839e0ee4da9c51b220de6816e97	["*"]	2026-07-13 06:12:47	\N	2026-07-13 05:45:49	2026-07-13 06:12:47
101	App\\Models\\User	1	api	55a8f137249f0f9aa8637859b4dd88e4b7067b556f17b27d910572aac88158da	["*"]	2026-07-05 05:14:13	\N	2026-07-05 03:59:36	2026-07-05 05:14:13
105	App\\Models\\User	1	api	b20792957cdf497b5e4d8602b6a6f236f874a13fd70bdf5984a56fd5a6b1efca	["*"]	2026-07-05 09:57:37	\N	2026-07-05 09:06:25	2026-07-05 09:57:37
107	App\\Models\\User	13	api	51797be324803dc4a84c40adaca7049247266fd10454878bdcecbcf0e7d9af99	["*"]	2026-07-05 09:28:48	\N	2026-07-05 09:22:57	2026-07-05 09:28:48
109	App\\Models\\User	1	api	1d67d49b0bbf5b71373a04cdcbd50bdd540435ddf1c080139887d5c99bbb961e	["*"]	2026-07-05 09:47:24	\N	2026-07-05 09:47:16	2026-07-05 09:47:24
112	App\\Models\\User	1	api	f404bc2601ca5449405ced49d92503e73ca48f491e2dd16b6d9505dedd489565	["*"]	2026-07-06 06:01:18	\N	2026-07-06 05:35:19	2026-07-06 06:01:18
113	App\\Models\\User	12	test	c4d737c494bc32560ef8e7d3fb3a5f5a3dc96326d0270e74fa7e89290164e6dd	["*"]	\N	\N	2026-07-13 05:38:59	2026-07-13 05:38:59
116	App\\Models\\User	1	api	02ce68aa2dd2109ce5ca68b89d46b7be23a1f3458519749c9815239e834b423f	["*"]	2026-07-13 08:23:19	\N	2026-07-13 06:47:21	2026-07-13 08:23:19
117	App\\Models\\User	1	api	a9ffc304a3f060a0bd3e2231dfa591e103d17d99eb02bc514d034e10a323ccff	["*"]	2026-07-13 10:50:54	\N	2026-07-13 10:50:47	2026-07-13 10:50:54
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, vendor_id, category_id, name, slug, description, price, sale_price, sku, stock_quantity, images, weight, is_featured, status, views, created_at, updated_at, deleted_at, cost_price, brand_id, attributes) FROM stdin;
23	6	42	গরুর জৈব খাদ্য (২৫ কেজি)	organic-cattle-feed	নমুনা পণ্য — Future Shop স্টোরফ্রন্ট পরীক্ষার জন্য।	1200.00	\N	\N	40	\N	\N	t	published	0	2026-05-31 09:34:50	2026-06-23 09:07:43	2026-06-23 09:07:43	0.00	\N	\N
25	6	43	ডিজিটাল থার্মোমিটার	dijital-tharmomitar	নমুনা পণ্য — Future Shop স্টোরফ্রন্ট পরীক্ষার জন্য।	350.00	\N	\N	59	[{"path":null,"url":"https:\\/\\/www.medistorebd.com\\/wp-content\\/uploads\\/2024\\/03\\/Digital-Thermometer.jpg","disk":"external"}]	\N	t	published	0	2026-05-31 09:34:50	2026-06-23 06:36:12	\N	0.00	\N	\N
26	6	43	পারিবারিক ফার্স্ট এইড কিট	paribarik-farst-eid-kit	নমুনা পণ্য — Future Shop স্টোরফ্রন্ট পরীক্ষার জন্য।	800.00	720.00	\N	30	[{"path":null,"url":"https:\\/\\/encrypted-tbn0.gstatic.com\\/images?q=tbn:ANd9GcSF24S08losLAoKMIn14tVNw_pUlW5gkqG4Nw&s","disk":"external"}]	\N	t	published	0	2026-05-31 09:34:50	2026-06-23 06:37:05	\N	0.00	\N	\N
22	6	41	খাঁটি সরিষার তেল (১ লিটার)	khannti-srishar-tel-1-litar	নমুনা পণ্য — Future Shop স্টোরফ্রন্ট পরীক্ষার জন্য।	280.00	\N	\N	80	[{"path":null,"url":"https:\\/\\/shorobor.biz\\/wp-content\\/uploads\\/2024\\/02\\/Shorobor-Mustard-Oil-%E0%A6%B8%E0%A6%B0%E0%A6%BF%E0%A6%B7%E0%A6%BE%E0%A6%B0-%E0%A6%A4%E0%A7%87%E0%A6%B2-image-1.webp","disk":"external"}]	\N	t	published	0	2026-05-31 09:34:50	2026-06-23 06:40:20	\N	0.00	\N	\N
24	6	42	হাইব্রিড সবজির বীজ প্যাক	hybrid-vegetable-seeds	নমুনা পণ্য — Future Shop স্টোরফ্রন্ট পরীক্ষার জন্য।	150.00	120.00	\N	200	\N	\N	t	published	0	2026-05-31 09:34:50	2026-06-23 09:07:31	2026-06-23 09:07:31	0.00	\N	\N
21	6	41	প্রিমিয়াম সুগন্ধি চাল (৫ কেজি)	premium-aromatic-rice	নমুনা পণ্য — Future Shop স্টোরফ্রন্ট পরীক্ষার জন্য।	650.00	599.00	\N	100	\N	\N	t	published	0	2026-05-31 09:34:50	2026-06-23 09:07:37	2026-06-23 09:07:37	0.00	\N	\N
31	6	41	Basundhara Soyabean Oil - 1L	basundhara-soyabean-oil-1l	১০০% বিশুদ্ধ এবং স্বাস্থ্যকর বসুন্ধরা ফর্টিফাইড সয়াবিন তেল। এতে রয়েছে ভিটামিন এ, ই এবং ডি, যা আপনার পরিবারের দৈনন্দিন রান্নায় পুষ্টি ও স্বাস্থ্য সুরক্ষা নিশ্চিত করে।	199.00	\N	\N	50	[{"path":"products\\/0d2f05a1-d4b4-41f9-8d54-f90492b86083.webp","url":"http:\\/\\/localhost:8000\\/storage\\/products\\/0d2f05a1-d4b4-41f9-8d54-f90492b86083.webp","disk":"public"}]	\N	f	published	0	2026-06-21 06:19:04	2026-06-23 09:14:40	\N	196.00	5	[{"title":"Volume","value":"1 Litre"}]
53	6	41	PRAN Mustard Oil - 16kg Tin	pran-mustard-oil-16kg-tin	১০০% খাঁটি ও বিশুদ্ধ প্রাণ সরিষার তেল ১৬ কেজির টিন। রেস্টুরেন্ট, ক্যাটারিং, বেকারি কিংবা যেকোনো বড় অনুষ্ঠানের রান্নার জন্য এটি সবচেয়ে সাশ্রয়ী এবং নির্ভরযোগ্য একটি অপশন।	3500.00	\N	\N	1	\N	\N	f	published	0	2026-06-23 11:40:21	2026-06-25 05:39:08	\N	3350.00	3	[{"title":"Size","value":"16kg"}]
33	6	41	ACI pure soyabean oil 1 ltr	aci-pure-soyabean-oil-1-ltr	\N	199.00	\N	\N	50	[{"path":null,"url":"https:\\/\\/bdtotals.com\\/wp-content\\/uploads\\/2025\\/01\\/Untitled-design-42.png","disk":"external"}]	\N	f	published	0	2026-06-23 09:20:24	2026-06-23 09:20:24	\N	198.00	2	[{"title":"Volume","value":"1 Litre"}]
34	6	41	ACI Salt - 1Kg	aci-salt-1kg	১০০% বিশুদ্ধ এবং ভ্যাকিউম ইভাপোরেটেড এসিআই পিওর সল্ট। এতে রয়েছে সঠিক মাত্রায় আয়োডিন, যা আপনার পরিবারের মেধা বিকাশ ও স্বাস্থ্য সুরক্ষা নিশ্চিত করে।	42.00	\N	\N	50	[{"path":null,"url":"https:\\/\\/chaldn.com\\/_mpimage\\/aci-pure-salt-1-kg?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D47100&q=best&v=1&m=400&webp=1","disk":"external"}]	\N	f	published	0	2026-06-23 09:27:04	2026-06-23 09:27:04	\N	38.00	2	[{"title":"Size","value":"1Kg"}]
32	6	64	Basundhara Soyabin Oil - 2L	basundhara-soyabin-oil-2l	Basundhara Soyabin Oil - 2L	398.00	398.00	\N	100	[{"path":null,"url":"https:\\/\\/chaldn.com\\/_mpimage\\/bashundhara-fortified-soyabean-oil-2-ltr?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D125455&q=best&v=1&m=400&m=400&webp=1","disk":"external"}]	\N	f	published	0	2026-06-23 09:17:51	2026-07-29 07:02:40	\N	392.00	5	[{"title":"Volume","value":"2 Litre"}]
97	6	65	Teer Muri - 250gm	teer-muri-250gm	Teer Muri - 250gm	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
35	6	41	ACI Salt Jar - 750gm	aci-salt-jar-750gm	প্রিমিয়াম কোয়ালিটির ১০০% বিশুদ্ধ এবং আয়োডিন যুক্ত এসিআই পিওর সল্ট। একটি আকর্ষণীয় ও মজবুত প্লাস্টিকের জারে প্যাক করা, যা লবণকে দীর্ঘক্ষণ আর্দ্রতামুক্ত রাখে ও ব্যবহার সুবিধাজনক করে।	59.00	\N	\N	50	[{"path":null,"url":"https:\\/\\/dookanpat.s3.ap-southeast-1.amazonaws.com\\/uploads\\/all\\/l9AKcc1JvX3lP2feIkoef0dWNycVEGLhUzKkKIqa.png","disk":"external"}]	\N	f	published	0	2026-06-23 09:29:48	2026-06-23 09:29:48	\N	52.00	2	[{"title":"Size","value":"750gm"}]
36	6	41	ACI Salt - 500gm	aci-salt-500gm	১০০% বিশুদ্ধ এবং ভ্যাকিউম ইভাপোরেটেড এসিআই পিওর সল্ট। ছোট পরিবারের দৈনন্দিন রান্নার সঠিক স্বাদ ও আয়োডিনের চাহিদা পূরণে এই প্যাকেজিংটি অত্যন্ত সাশ্রয়ী।	22.00	\N	\N	50	[{"path":null,"url":"https:\\/\\/chaldn.com\\/_mpimage\\/aci-pure-salt-500-gm?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D57736&q=best&v=1&m=400&webp=1","disk":"external"}]	\N	f	published	0	2026-06-23 09:31:28	2026-06-23 09:31:28	\N	19.50	2	[{"title":"Size","value":"500gm"}]
37	6	41	ACI Pure Suzi - 500gm	aci-pure-suzi-500gm	১০০% পরিষ্কার এবং বাছাইকৃত উন্নত মানের গম থেকে তৈরি এসিআই পিওর সুজি। এটি দিয়ে খুব সহজেই মজাদার হালুয়া, মিষ্টি, পিঠা ও অন্যান্য পুষ্টিকর নাস্তা তৈরি করা যায়। আপনার পরিবারের স্বাস্থ্যকর সকালের বা বিকেলের নাস্তার জন্য এটি একটি চমৎকার ও নিরাপদ পছন্দ।	48.00	\N	\N	50	[{"path":null,"url":"https:\\/\\/chaldn.com\\/_mpimage\\/aci-pure-suji-500-gm?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D177380&q=best&v=1&m=400&webp=1","disk":"external"}]	\N	f	published	0	2026-06-23 09:34:26	2026-06-23 09:34:26	\N	35.00	2	[{"title":"Size","value":"500gm"}]
38	6	41	ACI Pure Suzi - 250gm	aci-pure-suzi-250gm	১০০% পরিষ্কার এবং বাছাইকৃত উন্নত মানের গম থেকে তৈরি এসিআই পিওর সুজি। মজাদার হালুয়া, মিষ্টি বা বাচ্চাদের পুষ্টিকর খাবার তৈরিতে এটি দারুণ কার্যকরী। ছোট পরিবারের জন্য বা অল্প ব্যবহারের জন্য এই ২৫০ গ্রামের প্যাকেটটি অত্যন্ত সাশ্রয়ী।	25.00	\N	\N	50	[{"path":null,"url":"https:\\/\\/chaldn.com\\/_mpimage\\/aci-pure-suji-250-gm?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D177152&q=best&v=1&m=400&webp=1","disk":"external"}]	\N	f	published	0	2026-06-23 09:36:26	2026-06-23 09:36:26	\N	18.00	2	[{"title":"Size","value":"250gm"}]
39	6	41	ACI Aroma Mustard Oil - 1L	aci-aroma-mustard-oil-1l	সেরা মানের বাছাইকৃত দেশি সরিষা থেকে ঘানিতে ভাঙানো এসিআই অ্যারোমা সরিষার তেল। এর খাঁটি ঝাঁঝ ও মন মাতানো সুঘ্রাণ আপনার প্রতিদিনের রান্না ও ভর্তায় আনবে চমৎকার স্বাদ এবং নিশ্চিত করবে পরিবারের সুস্বাস্থ্য।	320.00	\N	\N	50	[{"path":null,"url":"https:\\/\\/www.aci-bd.com\\/assets\\/images\\/news\\/2021\\/aroma-edible-oil.png","disk":"external"}]	\N	f	published	0	2026-06-23 09:41:04	2026-06-23 09:41:04	\N	276.00	2	[{"title":"Size","value":"1 Liter"}]
40	6	41	ACI Aroma Mustard Oil - 500 ML	aci-aroma-mustard-oil-500-ml	সেরা মানের বাছাইকৃত দেশি সরিষা থেকে তৈরি ১০০% খাঁটি এসিআই অ্যারোমা সরিষার তেল। রান্নার স্বাদ বহুগুণ বাড়িয়ে দিতে এবং খাঁটি সরিষার ঝাঁঝ পেতে এই ৫০০ মিলি বোতলটি দারুণ সাশ্রয়ী।	145.00	\N	\N	50	[{"path":null,"url":"https:\\/\\/chaldn.com\\/_mpimage\\/aci-aroma-mustard-oil-500-ml?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D177222&q=best&v=1&m=400&webp=1","disk":"external"}]	\N	f	published	0	2026-06-23 09:45:57	2026-06-23 09:45:57	\N	140.00	2	[{"title":"Size","value":"500 ML"}]
41	6	41	ACI Aroma Mustard Oil - 250 ML	aci-aroma-mustard-oil-250-ml	স্বাস্থ্যকর ও খাঁটি এসিআই অ্যারোমা সরিষার তেল। ছোট পরিবারের জন্য বা রান্নায় অল্প ব্যবহারের জন্য এর ২৫০ মিলি বোতলটি খুব সহজেই ব্যবহারযোগ্য। এর নিখুঁত ঝাঁঝ রান্নায় আনে ঐতিহ্যবাহী স্বাদ।	85.00	\N	\N	50	[{"path":null,"url":"https:\\/\\/chaldn.com\\/_mpimage\\/aroma-mustard-oil-250-ml?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D125283&q=best&v=1&m=400&webp=1","disk":"external"},{"path":null,"url":"https:\\/\\/chaldn.com\\/_mpimage\\/aroma-mustard-oil-250-ml?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D177476&q=best&v=1&m=400&webp=1","disk":"external"}]	\N	f	published	0	2026-06-23 09:47:29	2026-06-23 09:47:29	\N	73.00	2	[{"title":"Size","value":"250 ML"}]
42	6	41	PRAN Mustard Oil - 80ml	pran-mustard-oil-80ml	উন্নত প্রযুক্তিতে বাছাইকৃত সরিষা থেকে তৈরি প্রাণ সরিষার তেল। এর প্রাকৃতিক ঝাঁঝ ও বিশুদ্ধতা রান্নার আসল স্বাদ নিশ্চিত করে। অল্প দরকারে ব্যবহারের জন্য বা সাথে রাখার জন্য এই ৮০ মিলি বোতলটি অত্যন্ত সুবিধাজনক।	30.00	\N	\N	50	[{"path":null,"url":"https:\\/\\/www.pranfoods.net\\/storage\\/products\\/7d605b33-769f-49c6-8e07-05f3799f9be2.png","disk":"external"},{"path":null,"url":"https:\\/\\/www.pranfoods.net\\/storage\\/products\\/a37657aa-ba1a-47b0-bb17-f99a31c7af70.png","disk":"external"},{"path":null,"url":"https:\\/\\/www.pranfoods.net\\/storage\\/products\\/94b3a0b9-1a49-4b8e-a4b0-7a77d11152b9.png","disk":"external"}]	\N	f	published	0	2026-06-23 09:49:41	2026-06-23 09:49:41	\N	27.00	3	[{"title":"Size","value":"80 ML"}]
43	6	41	PRAN Mustard Oil - 200-mL	pran-mustard-oil-200-ml	উন্নত মানের দেশি সরিষা থেকে ঘানিতে ভাঙানো প্রাণ সরিষার তেল। এর প্রাকৃতিক সুঘ্রাণ ও ঝাঁঝ রান্নার স্বাদকে করে তোলে অতুলনীয়। দৈনন্দিন ব্যবহারের জন্য এই ২০০ মিলি বোতলটি বেশ মানানসই।	70.00	\N	\N	24	[{"path":null,"url":"https:\\/\\/images.othoba.com\\/images\\/thumbs\\/0418194_pran-mustard-oil-250ml.jpeg","disk":"external"}]	\N	f	published	0	2026-06-23 09:53:37	2026-06-23 09:53:37	\N	61.70	3	[{"title":"Size","value":"200-mL"}]
44	6	41	PRAN Mustard Oil - 250ml	pran-mustard-oil-250ml	১০০% বিশুদ্ধ ও খাঁটি প্রাণ সরিষার তেল। ভর্তা কিংবা তরকারিতে সঠিক ঝাঁঝ ও স্বাদ আনতে এর জুড়ি নেই। ছোট পরিবারের জন্য ২৫০ মিলি বোতলটি অত্যন্ত সুবিধাজনক।	85.00	\N	\N	24	[{"path":null,"url":"https:\\/\\/images.othoba.com\\/images\\/thumbs\\/0418194_pran-mustard-oil-250ml.jpeg","disk":"external"}]	\N	f	published	0	2026-06-23 09:55:04	2026-06-23 09:55:04	\N	77.00	3	[{"title":"Size","value":"250ml"}]
45	6	41	PRAN Mustard Oil - 500 ml	pran-mustard-oil-500-ml	স্বাস্থ্যকর এবং উন্নত প্রযুক্তিতে তৈরি প্রাণ খাঁটি সরিষার তেল। পরিবারের প্রতিদিনের রান্নায় ঐতিহ্যবাহী স্বাদ ও সুঘ্রাণ নিশ্চিত করতে এই ৫০০ মিলি বোতলটি একটি চমৎকার পছন্দ।	170.00	\N	\N	24	[{"path":null,"url":"https:\\/\\/chaldn.com\\/_mpimage\\/pran-mustard-oil-500-ml?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D132319&q=best&v=1&m=400&webp=1","disk":"external"}]	\N	f	published	0	2026-06-23 09:56:26	2026-06-23 09:56:26	\N	154.00	3	[{"title":"Size","value":"500 ml"}]
47	6	41	PRAN Mustard Oil - 1000ml	pran-mustard-oil-1000ml	১০০% খাঁটি ও বিশুদ্ধ প্রাণ সরিষার তেল। এর প্রাকৃতিক ঝাঁঝ ও সুঘ্রাণ আপনার প্রতিদিনের রান্নাকে করে তুলবে আরও সুস্বাদু ও স্বাস্থ্যকর। পরিবারের দৈনন্দিন ব্যবহারের জন্য এই ১০০০ মিলি (১ লিটার) বোতলটি দারুণ।	340.00	\N	\N	12	[{"path":null,"url":"https:\\/\\/images.othoba.com\\/images\\/thumbs\\/0335299_pran-mustard-oil-1000ml.png","disk":"external"}]	\N	f	published	0	2026-06-23 10:10:04	2026-06-23 10:10:04	\N	310.00	3	[{"title":"Size","value":"1000ml"}]
49	6	41	PRAN Mustard Oil - 2 liter	pran-mustard-oil-2-liter	স্বাস্থ্যকর ও বিশুদ্ধ প্রাণ খাঁটি সরিষার তেল। পরিবারের মাসিক বাজারের চাহিদা মেটাতে এবং রান্নায় খাঁটি স্বাদ নিশ্চিত করতে ২ লিটারের এই মজবুত বোতলটি অত্যন্ত সাশ্রয়ী।	655.00	\N	\N	19	[{"path":null,"url":"https:\\/\\/images.othoba.com\\/images\\/thumbs\\/0495369_pran-mustard-oil-2000ml.webp","disk":"external"}]	\N	f	published	0	2026-06-23 10:48:31	2026-06-23 10:48:31	\N	595.00	3	[{"title":"Size","value":"2 liter"}]
29	6	41	বসুন্ধরা টিস্যু বক্স - ১০০ পিস	bsundhra-tiszu-bks-100-pis	বসুন্ধরা ফেসিয়াল টিস্যু বক্স (১০০ পিস) আপনার দৈনন্দিন পরিষ্কার-পরিচ্ছন্নতা এবং ত্বকের যত্নের জন্য একটি নির্ভরযোগ্য পণ্য। এটি ১০০% ভার্জিন পাল্প দিয়ে তৈরি, যা ত্বকের জন্য অত্যন্ত নরম, স্বাস্থ্যসম্মত এবং নিরাপদ। বাসা, অফিস বা গাড়িতে ব্যবহারের জন্য এর বক্স প্যাকেজিং অত্যন্ত সুবিধাজনক।	75.00	\N	\N	100	[{"path":null,"url":"https:\\/\\/www.bashundharapapermills.com\\/assets\\/upload\\/wallpaper_1735549205.jpg","disk":"external"}]	\N	f	published	0	2026-06-16 07:39:22	2026-06-23 06:37:58	\N	56.50	\N	\N
30	6	41	Lemon Flavored Tissue Box - 120 Pcs	lemon-flavored-tissue-box-120-pcs	লেমন ফ্লেভারযুক্ত এই টিস্যু বক্সটি আপনার দৈনন্দিন ব্যবহারের জন্য একটি সাশ্রয়ী ও কার্যকরী পণ্য। ১২০ পিসের এই বক্সে থাকা প্রতিটি টিস্যু নরম এবং রিফ্রেশিং লেবুর সুবাসযুক্ত, যা ব্যবহারের সময় সতেজ অনুভূতি দেয়।	85.00	\N	\N	0	[{"path":null,"url":"https:\\/\\/www.bashundharapapermills.com\\/assets\\/upload\\/wallpaper_1735549176.jpg","disk":"external"}]	\N	f	published	0	2026-06-16 07:50:32	2026-06-25 05:26:13	\N	63.00	\N	\N
52	6	41	PRAN Mughal Mustard Oil - 150 ml	pran-mughal-mustard-oil-150-ml-2	প্রাণ মুঘল সরিষার তেল (নতুন মূল্য)। রান্নায় সঠিক স্বাদ ও খাঁটি সরিষার সুঘ্রাণ নিশ্চিত করতে এটি একটি চমৎকার পছন্দ। দৈনন্দিন ব্যবহারের জন্য এই ১৫০ মিলি বোতলটি সুবিধাজনক।	55.00	\N	\N	23	[{"path":null,"url":"https:\\/\\/www.pranfoods.net\\/storage\\/products\\/71f81416-49f4-46bd-829f-62737570958d.png","disk":"external"}]	\N	f	published	0	2026-06-23 11:37:29	2026-06-28 06:15:34	\N	42.99	3	[{"title":"Size","value":"150 ml"}]
51	6	41	PRAN Mughal Mustard Oil - 90 ml	pran-mughal-mustard-oil-90-ml-2	প্রাণ মুঘল সরিষার তেল (নতুন মূল্য)। মুঘল ঐতিহ্যের আসল স্বাদ ও কড়া ঝাঁঝ পেতে এটি দারুণ কার্যকরী। অল্প পরিমাণে ব্যবহারের জন্য এই ৯০ মিলি বোতলটি বেশ মানানসই।	35.00	\N	\N	47	[{"path":"products\\/8d706e16-40de-478d-80b0-3a61d7398d05.png","url":"http:\\/\\/localhost:8000\\/storage\\/products\\/8d706e16-40de-478d-80b0-3a61d7398d05.png","disk":"public"}]	\N	f	published	0	2026-06-23 11:36:23	2026-06-28 06:15:34	\N	26.00	3	[{"title":"Size","value":"90 ml"}]
50	6	41	PRAN Mustard Oil - 5 Liter	pran-mustard-oil-5-liter	সেরা মানের বাছাইকৃত সরিষা থেকে তৈরি ১০০% বিশুদ্ধ প্রাণ সরিষার তেল (M. Oil)। বড় পরিবারের দীর্ঘদিনের ব্যবহার, হোটেল বা রেস্টুরেন্টের জন্য ৫ লিটারের এই জারটি সবচেয়ে সাশ্রয়ী এবং সুবিধাজনক।	1400.00	\N	\N	9	[{"path":null,"url":"https:\\/\\/images.othoba.com\\/images\\/thumbs\\/0386376_pran-mustard-oil-5-liter.jpeg","disk":"external"}]	\N	f	published	0	2026-06-23 10:56:41	2026-06-28 06:15:34	\N	1238.00	3	[{"title":"Size","value":"5 Liter"}]
54	6	41	Acme Mustard Oil - 80ml	acme-mustard-oil-80ml	উন্নত মানের বাছাইকৃত সরিষা থেকে তৈরি অ্যাকমি (Acme) খাঁটি সরিষার তেল। এর প্রাকৃতিক ঝাঁঝ আপনার প্রতিদিনের ভর্তা বা রান্নায় আনবে বাড়তি স্বাদ। সাথে রাখার জন্য বা অল্প ব্যবহারে ৮০ মিলির এই বোতলটি দারুণ।	35.00	\N	\N	50	[{"path":null,"url":"https:\\/\\/chaldn.com\\/_mpimage\\/acme-mustard-oil-200-ml?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D101020&q=best&v=1&m=400&webp=1","disk":"external"}]	\N	f	published	0	2026-06-23 11:42:06	2026-07-04 03:47:49	\N	26.50	9	[{"title":"Size","value":"80ml"}]
95	6	65	Teer Masturd Oil - 500ML	teer-masturd-oil-500ml	Teer Masturd Oil - 500ML	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
96	6	65	Teer Masturd Oil - 1L	teer-masturd-oil-1l	Teer Masturd Oil - 1L	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
98	6	65	Teer Muri - 500gm	teer-muri-500gm	Teer Muri - 500gm	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
99	6	65	Suger teer - 1KG	suger-teer-1kg	Suger teer - 1KG	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
100	6	65	Teer Nazirshal Chal - 5 kg	teer-nazirshal-chal-5-kg	Teer Nazirshal Chal - 5 kg	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
101	6	65	Teer Katarivog - 5Kg	teer-katarivog-5kg	Teer Katarivog - 5Kg	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
102	6	65	Teer Katarivog - 25 Kg	teer-katarivog-25-kg	Teer Katarivog - 25 Kg	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
103	6	65	Teer Mashur dal - 1 Kg	teer-mashur-dal-1-kg	Teer Mashur dal - 1 Kg	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
107	6	66	Aroma Mustard Oil - 1L	aroma-mustard-oil-1l-6a69a7e90e1b6	Aroma Mustard Oil - 1L	320.00	320.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	276.00	\N	\N
108	6	66	500 ML	500-ml-6a69a7e90f78b	500 ML	5.00	5.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	145.00	\N	\N
104	6	65	Teer Nataral 500 ML  (Boottle)	teer-nataral-500-ml-boottle	Teer Nataral 500 ML  (Boottle)	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
105	6	65	Teer Nataral 1L  (Boottle)	teer-nataral-1l-boottle	Teer Nataral 1L  (Boottle)	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
106	6	66	Product Name - Size	product-name-size-6a69a7e90179f	Product Name - Size	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
86	6	65	Teer Soyabin - 250 ml	teer-soyabin-250-ml	Teer Soyabin - 250 ml	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
87	6	65	Teer Soyabin - 1L poly	teer-soyabin-1l-poly	Teer Soyabin - 1L poly	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
88	6	65	Teer Soyabin bottle - 500ml	teer-soyabin-bottle-500ml	Teer Soyabin bottle - 500ml	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
89	6	65	Teer Soyabin - 2 L	teer-soyabin-2-l	Teer Soyabin - 2 L	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
90	6	65	Teer Soyabin - 3 L	teer-soyabin-3-l	Teer Soyabin - 3 L	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
91	6	65	Teer Soyabin - 5L	teer-soyabin-5l	Teer Soyabin - 5L	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
92	6	65	Teer Soyabin - 8L	teer-soyabin-8l	Teer Soyabin - 8L	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
93	6	65	Teer Masturd Oil - 80 ml	teer-masturd-oil-80-ml	Teer Masturd Oil - 80 ml	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
94	6	65	Teer Masturd Oil - 250 Ml	teer-masturd-oil-250-ml	Teer Masturd Oil - 250 Ml	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
83	6	64	Basundhara Soyabin Oil - 1L	basundhara-soyabin-oil-1l	Basundhara Soyabin Oil - 1L	199.00	199.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	196.00	\N	\N
84	6	65	Aci Pure Soyabin Oil - 1L	aci-pure-soyabin-oil-1l	Aci Pure Soyabin Oil - 1L	199.00	199.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	198.00	\N	\N
85	6	65	Pure Soyabin Oil - 5L	pure-soyabin-oil-5l	Pure Soyabin Oil - 5L	975.00	975.00	\N	100	\N	\N	f	published	0	2026-07-29 07:02:40	2026-07-29 08:48:52	2026-07-29 08:48:52	970.00	\N	\N
109	6	66	250 ML	250-ml-6a69a7e910864	250 ML	12.00	12.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	85.00	\N	\N
110	6	66	Mustard Oil - 80ml	mustard-oil-80ml-6a69a7e91169f	Mustard Oil - 80ml	30.00	30.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	27.00	\N	\N
111	6	66	200-mL	200-ml-6a69a7e912d77	200-mL	8.30	8.30	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	70.00	\N	\N
112	6	66	250ml	250ml-6a69a7e913f5e	250ml	8.00	8.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	85.00	\N	\N
113	6	66	500 ml	500-ml-6a69a7e914f2c	500 ml	16.00	16.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	170.00	\N	\N
115	6	66	1000ml	1000ml-6a69a7e917578	1000ml	30.00	30.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	340.00	\N	\N
117	6	66	2 liter	2-liter-6a69a7e918e23	2 liter	60.00	60.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	655.00	\N	\N
118	6	66	5 Liter	5-liter-6a69a7e919b6b	5 Liter	162.00	162.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	1.00	\N	\N
114	6	66	90 ml	90-ml-6a69a7e91aeb8	90 ml	9.00	9.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	35.00	\N	\N
116	6	66	150 ml	150-ml-6a69a7e91ef54	150 ml	12.00	12.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	55.00	\N	\N
119	6	66	16kg Tin	16kg-tin-6a69a7e91fe75	16kg Tin	150.00	150.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	3.00	\N	\N
120	6	66	Acme Mustard oil - 80ml	acme-mustard-oil-80ml-6a69a7e920d1b	Acme Mustard oil - 80ml	35.00	35.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	26.50	\N	\N
121	6	67	Brawon Aata - 1kg	brawon-aata-1kg-6a69a7e92297a	Brawon Aata - 1kg	70.00	70.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	60.00	\N	\N
122	6	67	Pure Aata - 1kg	pure-aata-1kg-6a69a7e923cd0	Pure Aata - 1kg	65.00	65.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	47.00	\N	\N
123	6	67	Pure Moida - 1kg	pure-moida-1kg-6a69a7e924d26	Pure Moida - 1kg	70.00	70.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	60.00	\N	\N
124	6	68	Pure Chini gura Chal - 1kg	pure-chini-gura-chal-1kg-6a69a7e92a1a9	Pure Chini gura Chal - 1kg	190.00	190.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	168.00	\N	\N
125	6	68	ChashiChinigura - 1Kg	chashichinigura-1kg-6a69a7e92b748	ChashiChinigura - 1Kg	190.00	190.00	\N	100	\N	\N	f	published	0	2026-07-29 07:12:41	2026-07-29 08:48:52	2026-07-29 08:48:52	170.00	\N	\N
126	6	66	Aci - Aroma Mustard Oil	aci-aroma-mustard-oil	Aci - Aroma Mustard Oil	276.00	276.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
127	6	66	Aroma Mustard Oil - 500 ML	aroma-mustard-oil-500-ml	Aroma Mustard Oil - 500 ML	145.00	145.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	140.00	\N	\N
128	6	66	Aroma Mustard Oil - 250 ML	aroma-mustard-oil-250-ml	Aroma Mustard Oil - 250 ML	85.00	85.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	73.00	\N	\N
129	6	66	PRAN - Mustard Oil	pran-mustard-oil	PRAN - Mustard Oil	27.00	27.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	48.00	\N	\N
130	6	66	Mustard Oil - 200-mL	mustard-oil-200-ml	Mustard Oil - 200-mL	70.00	70.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	61.70	\N	\N
131	6	66	Mustard Oil - 250ml	mustard-oil-250ml	Mustard Oil - 250ml	85.00	85.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	77.00	\N	\N
132	6	66	Mustard Oil - 500 ml	mustard-oil-500-ml	Mustard Oil - 500 ml	170.00	170.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	154.00	\N	\N
133	6	66	Mughal Mustard Oil - 90 ml	mughal-mustard-oil-90-ml	Mughal Mustard Oil - 90 ml	30.00	30.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	26.50	\N	\N
134	6	66	Mustard Oil - 1000ml	mustard-oil-1000ml	Mustard Oil - 1000ml	340.00	340.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	310.00	\N	\N
135	6	66	Mughal - 150 ml	mughal-150-ml	Mughal - 150 ml	50.00	50.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	43.46	\N	\N
136	6	66	Mustard oil - 2 liter	mustard-oil-2-liter	Mustard oil - 2 liter	655.00	655.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	595.00	\N	\N
137	6	66	M . Oil - 5 Liter	m-oil-5-liter	M . Oil - 5 Liter	1400.00	1400.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	1238.00	\N	\N
138	6	66	Mughal - 90 ml	mughal-90-ml	Mughal - 90 ml	35.00	35.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	26.00	\N	\N
139	6	66	Mughal - 150 ml	mughal-150-ml-1	Mughal - 150 ml	55.00	55.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	43.00	\N	\N
140	6	66	Mustard oil - 16kg Tin	mustard-oil-16kg-tin	Mustard oil - 16kg Tin	3500.00	3500.00	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	3350.00	\N	\N
141	6	66	Acme - Acme Mustard oil	acme-acme-mustard-oil	Acme - Acme Mustard oil	26.50	26.50	\N	100	\N	\N	f	published	0	2026-07-29 08:48:17	2026-07-29 08:48:52	2026-07-29 08:48:52	0.00	\N	\N
142	6	66	Aci - Aroma Mustard Oil	aci-aroma-mustard-oil-1	Aci - Aroma Mustard Oil	276.00	276.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	0.00	\N	\N
143	6	66	Aroma Mustard Oil - 500 ML	aroma-mustard-oil-500-ml-1	Aroma Mustard Oil - 500 ML	145.00	145.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	140.00	\N	\N
144	6	66	Aroma Mustard Oil - 250 ML	aroma-mustard-oil-250-ml-1	Aroma Mustard Oil - 250 ML	85.00	85.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	73.00	\N	\N
145	6	66	PRAN - Mustard Oil	pran-mustard-oil-1	PRAN - Mustard Oil	27.00	27.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	48.00	\N	\N
146	6	66	Mustard Oil - 200-mL	mustard-oil-200-ml-1	Mustard Oil - 200-mL	70.00	70.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	61.70	\N	\N
147	6	66	Mustard Oil - 250ml	mustard-oil-250ml-1	Mustard Oil - 250ml	85.00	85.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	77.00	\N	\N
148	6	66	Mustard Oil - 500 ml	mustard-oil-500-ml-1	Mustard Oil - 500 ml	170.00	170.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	154.00	\N	\N
149	6	66	Mughal Mustard Oil - 90 ml	mughal-mustard-oil-90-ml-1	Mughal Mustard Oil - 90 ml	30.00	30.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	26.50	\N	\N
150	6	66	Mustard Oil - 1000ml	mustard-oil-1000ml-1	Mustard Oil - 1000ml	340.00	340.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	310.00	\N	\N
152	6	66	Mustard oil - 2 liter	mustard-oil-2-liter-1	Mustard oil - 2 liter	655.00	655.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	595.00	\N	\N
153	6	66	M . Oil - 5 Liter	m-oil-5-liter-1	M . Oil - 5 Liter	1400.00	1400.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	1238.00	\N	\N
154	6	66	Mughal - 90 ml	mughal-90-ml-1	Mughal - 90 ml	35.00	35.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	26.00	\N	\N
155	6	66	Mughal - 150 ml	mughal-150-ml-3	Mughal - 150 ml	55.00	55.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	43.00	\N	\N
156	6	66	Mustard oil - 16kg Tin	mustard-oil-16kg-tin-1	Mustard oil - 16kg Tin	3500.00	3500.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	3350.00	\N	\N
157	6	66	Acme - Acme Mustard oil	acme-acme-mustard-oil-1	Acme - Acme Mustard oil	26.50	26.50	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	0.00	\N	\N
158	6	70	ACI - Brawon Aata	aci-brawon-aata	ACI - Brawon Aata	60.00	60.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	0.00	\N	\N
159	6	70	ACI - Pure Aata	aci-pure-aata	ACI - Pure Aata	47.00	47.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	0.00	\N	\N
160	6	70	ACI - Pure Moida	aci-pure-moida	ACI - Pure Moida	60.00	60.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	0.00	\N	\N
161	6	68	ACI - Pure Chini gura Chal	aci-pure-chini-gura-chal	ACI - Pure Chini gura Chal	168.00	168.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	0.00	\N	\N
162	6	68	Square - ChashiChinigura	square-chashichinigura	Square - ChashiChinigura	170.00	170.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	0.00	\N	\N
163	6	68	2Kg	2kg	2Kg	34.00	34.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	370.00	\N	\N
164	6	68	5Kg	5kg	5Kg	82.00	82.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	910.00	\N	\N
165	6	71	Pran - Pran Full Cream Milk Powder-10gm	pran-pran-full-cream-milk-powder-10gm	Pran - Pran Full Cream Milk Powder-10gm	8.20	8.20	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	0.00	\N	\N
166	6	71	Pran Full Cream Milk Powder-50gm - 1 Crt=72Pcs	pran-full-cream-milk-powder-50gm-1-crt72pcs	Pran Full Cream Milk Powder-50gm - 1 Crt=72Pcs	50.00	50.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	42.00	\N	\N
167	6	71	Pran Full Cream Milk Powder-200gm - 1 Crt=30Pcs	pran-full-cream-milk-powder-200gm-1-crt30pcs	Pran Full Cream Milk Powder-200gm - 1 Crt=30Pcs	200.00	200.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	184.50	\N	\N
168	6	71	Pran Full Cream Milk Powder-400gm - 1 Crt=24 Pcs	pran-full-cream-milk-powder-400gm-1-crt24-pcs	Pran Full Cream Milk Powder-400gm - 1 Crt=24 Pcs	390.00	390.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	351.30	\N	\N
169	6	71	Pran Full Cream Milk Powder-500gm - 1 Crt=24 Pcs	pran-full-cream-milk-powder-500gm-1-crt24-pcs	Pran Full Cream Milk Powder-500gm - 1 Crt=24 Pcs	460.00	460.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	427.52	\N	\N
170	6	71	Pran Full Cream Milk Powder-1000gm - 1 Crt=12pcs	pran-full-cream-milk-powder-1000gm-1-crt12pcs	Pran Full Cream Milk Powder-1000gm - 1 Crt=12pcs	925.00	925.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	870.00	\N	\N
171	6	71	Milkman UHT 200ml - 1 Crt=30 Pcs	milkman-uht-200ml-1-crt30-pcs	Milkman UHT 200ml - 1 Crt=30 Pcs	30.00	30.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	26.00	\N	\N
172	6	71	Milkman UHT 500ml - 1 Crt=16 Pcs	milkman-uht-500ml-1-crt16-pcs	Milkman UHT 500ml - 1 Crt=16 Pcs	60.00	60.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	54.00	\N	\N
173	6	71	Electrolyte Drink 200ML Orange - 1 Crt=24 Pcs	electrolyte-drink-200ml-orange-1-crt24-pcs	Electrolyte Drink 200ML Orange - 1 Crt=24 Pcs	25.00	25.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	20.00	\N	\N
174	6	71	Electrolyte Drink 200ML Lemon - 1 Crt=24 Pcs	electrolyte-drink-200ml-lemon-1-crt24-pcs	Electrolyte Drink 200ML Lemon - 1 Crt=24 Pcs	25.00	25.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	20.00	\N	\N
175	6	71	Super Milk 200gm - 1 Crt=24 Pcs	super-milk-200gm-1-crt24-pcs	Super Milk 200gm - 1 Crt=24 Pcs	165.00	165.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	160.00	\N	\N
176	6	71	Super Milk 500gm - 1 Crt=24 Pcs	super-milk-500gm-1-crt24-pcs	Super Milk 500gm - 1 Crt=24 Pcs	365.00	365.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	345.00	\N	\N
177	6	71	Super Milk 1Kg - 1 Crt=12 Pcs	super-milk-1kg-1-crt12-pcs	Super Milk 1Kg - 1 Crt=12 Pcs	690.00	690.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	673.00	\N	\N
178	6	71	Super Milk 2Kg - 1 Crt=6 Pcs	super-milk-2kg-1-crt6-pcs	Super Milk 2Kg - 1 Crt=6 Pcs	1345.00	1345.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	1256.00	\N	\N
179	6	71	Dano - Dano Power full Creme	dano-dano-power-full-creme	Dano - Dano Power full Creme	450.00	450.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	5.00	\N	\N
180	6	71	Dano Power full Creme - 400gm	dano-power-full-creme-400gm	Dano Power full Creme - 400gm	400.00	400.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	375.00	\N	\N
181	6	71	Dano Delight - 500gm	dano-delight-500gm	Dano Delight - 500gm	480.00	480.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	450.00	\N	\N
182	6	71	Dano Delight - 200gm	dano-delight-200gm	Dano Delight - 200gm	205.00	205.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	185.00	\N	\N
183	6	71	Dano Daily Pusti - 1Kg	dano-daily-pusti-1kg	Dano Daily Pusti - 1Kg	760.00	760.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	710.00	\N	\N
184	6	71	Dano Daily Pusti - 500gm	dano-daily-pusti-500gm	Dano Daily Pusti - 500gm	400.00	400.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	360.00	\N	\N
185	6	71	Dano Daily Pusti - 200gm	dano-daily-pusti-200gm	Dano Daily Pusti - 200gm	180.00	180.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	150.00	\N	\N
186	6	71	Dano Daily Pusti - 100gm	dano-daily-pusti-100gm	Dano Daily Pusti - 100gm	95.00	95.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	82.00	\N	\N
187	6	71	Dano Daily Pusti - 50gm	dano-daily-pusti-50gm	Dano Daily Pusti - 50gm	50.00	50.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	40.00	\N	\N
188	6	71	Dano Daily Pusti - 20gm	dano-daily-pusti-20gm	Dano Daily Pusti - 20gm	20.00	20.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	17.00	\N	\N
189	6	71	Dano Daily Pusti - 10gm	dano-daily-pusti-10gm	Dano Daily Pusti - 10gm	10.00	10.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	8.00	\N	\N
190	6	72	Atlas Neo Extra Power - 2000gm	atlas-neo-extra-power-2000gm	Atlas Neo Extra Power - 2000gm	360.00	360.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	330.00	\N	\N
191	6	72	Neo Extra Power 2000gm - 20L Bucket RFL	neo-extra-power-2000gm-20l-bucket-rfl	Neo Extra Power 2000gm - 20L Bucket RFL	40.00	40.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	360.00	\N	\N
192	6	72	Neo Extra Power 2000gm - 20L Boul RFL	neo-extra-power-2000gm-20l-boul-rfl	Neo Extra Power 2000gm - 20L Boul RFL	60.00	60.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	360.00	\N	\N
193	6	72	Neo Extra Power 2000gm - Without CP	neo-extra-power-2000gm-without-cp	Neo Extra Power 2000gm - Without CP	150.00	150.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	360.00	\N	\N
194	6	72	RSPL GHARI Ghari - 2kg	rspl-ghari-ghari-2kg	RSPL GHARI Ghari - 2kg	370.00	370.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	333.33	\N	\N
195	6	72	GDP CP 2kg	gdp-cp-2kg	GDP CP 2kg	35.20	35.20	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	270.00	\N	\N
197	6	72	GDP NCP 2kg	gdp-ncp-2kg-1	GDP NCP 2kg	15.13	15.13	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	140.00	\N	\N
198	6	72	GDP 1kg	gdp-1kg	GDP 1kg	7.96	7.96	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	70.00	\N	\N
199	6	72	GDP 500gm	gdp-500gm	GDP 500gm	2.78	2.78	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	30.00	\N	\N
200	6	72	GDP 200gm	gdp-200gm	GDP 200gm	0.33	0.33	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	3.00	\N	\N
201	6	72	GDP 20gm	gdp-20gm	GDP 20gm	44.15	44.15	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	400.00	\N	\N
203	6	72	UDP CP 2kg	udp-cp-2kg-1	UDP CP 2kg	34.77	34.77	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	315.00	\N	\N
204	6	72	Uni Wash UDP (30tk Off) - 2kg	uni-wash-udp-30tk-off-2kg	Uni Wash UDP (30tk Off) - 2kg	175.00	175.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	155.68	\N	\N
206	6	72	UDP 1kg	udp-1kg-1	UDP 1kg	8.26	8.26	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	90.00	\N	\N
207	6	72	UDP 500gm	udp-500gm	UDP 500gm	3.26	3.26	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	35.00	\N	\N
208	6	72	UDP 200gm	udp-200gm	UDP 200gm	0.56	0.56	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	5.00	\N	\N
209	6	72	UDP 25gm	udp-25gm	UDP 25gm	0.56	0.56	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	5.00	\N	\N
210	6	72	Bashundhara Power Wash Detergent Powder ( White) - 25gm	bashundhara-power-wash-detergent-powder-white-25gm	Bashundhara Power Wash Detergent Powder ( White) - 25gm	5.00	5.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	4.00	\N	\N
211	6	72	Power Wash Detergent Powder ( White) 50gm	power-wash-detergent-powder-white-50gm	Power Wash Detergent Powder ( White) 50gm	2.10	2.10	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	10.00	\N	\N
212	6	72	Power Wash Detergent Powder ( White) 1 kg	power-wash-detergent-powder-white-1-kg	Power Wash Detergent Powder ( White) 1 kg	38.00	38.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	190.00	\N	\N
213	6	72	Power Wash Detergent Powder ( White) 500gm	power-wash-detergent-powder-white-500gm	Power Wash Detergent Powder ( White) 500gm	24.00	24.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	90.00	\N	\N
214	6	72	Power Wash Detergent Powder ( White) 200gm	power-wash-detergent-powder-white-200gm	Power Wash Detergent Powder ( White) 200gm	11.00	11.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	40.00	\N	\N
215	6	72	Power Wash Detergent Powder ( White) 2 kg	power-wash-detergent-powder-white-2-kg	Power Wash Detergent Powder ( White) 2 kg	60.00	60.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	400.00	\N	\N
216	6	72	Power Wash Detergent Powder (Lemon) 200gm	power-wash-detergent-powder-lemon-200gm	Power Wash Detergent Powder (Lemon) 200gm	7.00	7.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	30.00	\N	\N
217	6	72	Power Wash Detergent Powder (Lemon) 500gm	power-wash-detergent-powder-lemon-500gm	Power Wash Detergent Powder (Lemon) 500gm	17.00	17.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	70.00	\N	\N
218	6	72	Power Wash Detergent Powder (Lemon) 1kg	power-wash-detergent-powder-lemon-1kg	Power Wash Detergent Powder (Lemon) 1kg	30.00	30.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	140.00	\N	\N
219	6	72	Power Wash Detergent Powder (Lemon) 2 kg	power-wash-detergent-powder-lemon-2-kg	Power Wash Detergent Powder (Lemon) 2 kg	40.00	40.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	360.00	\N	\N
220	6	72	Pran Kleen Detergent Powder 500gm (without CP) - 500gm	pran-kleen-detergent-powder-500gm-without-cp-500gm	Pran Kleen Detergent Powder 500gm (without CP) - 500gm	80.00	80.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	67.00	\N	\N
221	6	72	Kleen Detergent Powder 1000gm 1000gm	kleen-detergent-powder-1000gm-1000gm	Kleen Detergent Powder 1000gm 1000gm	50.00	50.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	155.00	\N	\N
222	6	72	Kleen Detergent Powder 2000gm Non-CP 2000gm	kleen-detergent-powder-2000gm-non-cp-2000gm	Kleen Detergent Powder 2000gm Non-CP 2000gm	75.00	75.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	290.00	\N	\N
223	6	72	Surjo White Detergent Powder 70gm 70gm	surjo-white-detergent-powder-70gm-70gm	Surjo White Detergent Powder 70gm 70gm	1.23	1.23	\N	100	\N	\N	f	published	0	2026-07-29 08:49:03	2026-07-29 08:49:03	\N	10.00	\N	\N
224	6	72	Surjo White Detergent Powder 200gm 200gm	surjo-white-detergent-powder-200gm-200gm	Surjo White Detergent Powder 200gm 200gm	5.00	5.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	30.00	\N	\N
225	6	72	Surjo White Detergent Powder 500gm Non-CP 500gm	surjo-white-detergent-powder-500gm-non-cp-500gm	Surjo White Detergent Powder 500gm Non-CP 500gm	13.00	13.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	80.00	\N	\N
226	6	72	Surjo White Detergent Powder 1000gm 1000gm	surjo-white-detergent-powder-1000gm-1000gm	Surjo White Detergent Powder 1000gm 1000gm	25.00	25.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	155.00	\N	\N
227	6	72	Surjo White Detergent Powder 2000gm Non-CP 2000gm	surjo-white-detergent-powder-2000gm-non-cp-2000gm	Surjo White Detergent Powder 2000gm Non-CP 2000gm	75.00	75.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	290.00	\N	\N
228	6	72	Kazi Group Mr. White - 1kg	kazi-group-mr-white-1kg	Kazi Group Mr. White - 1kg	165.00	165.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	130.00	\N	\N
229	6	72	Mr. White 2kg	mr-white-2kg	Mr. White 2kg	55.00	55.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	360.00	\N	\N
231	6	72	Mr. White 200gm	mr-white-200gm	Mr. White 200gm	11.00	11.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	40.00	\N	\N
232	6	72	Mr. White Mini 30gm	mr-white-mini-30gm	Mr. White Mini 30gm	1.00	1.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	5.00	\N	\N
233	6	72	Lemon White 200gm	lemon-white-200gm	Lemon White 200gm	8.50	8.50	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	30.00	\N	\N
234	6	72	Mr. White 500gm	mr-white-500gm-1	Mr. White 500gm	25.00	25.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	75.00	\N	\N
235	6	72	Kohinur Chamical Fast Wash Detergent Powder - 30gm	kohinur-chamical-fast-wash-detergent-powder-30gm	Kohinur Chamical Fast Wash Detergent Powder - 30gm	5.00	5.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	4.85	\N	\N
236	6	72	Fast Wash Detergent Powder 200gm	fast-wash-detergent-powder-200gm	Fast Wash Detergent Powder 200gm	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	40.00	\N	\N
237	6	72	Fast Wash Detergent Powder 500gm	fast-wash-detergent-powder-500gm	Fast Wash Detergent Powder 500gm	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	90.00	\N	\N
238	6	72	Fast Wash Detergent Powder 1000gm	fast-wash-detergent-powder-1000gm	Fast Wash Detergent Powder 1000gm	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	175.00	\N	\N
239	6	72	Fast Wash Detergent Powder 2000gm	fast-wash-detergent-powder-2000gm	Fast Wash Detergent Powder 2000gm	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	315320.00	\N	\N
240	6	72	Fast Wash Liquid Detergent 400ml	fast-wash-liquid-detergent-400ml	Fast Wash Liquid Detergent 400ml	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	110120.00	\N	\N
241	6	72	Tibet Detergent Powder 200gm	tibet-detergent-powder-200gm	Tibet Detergent Powder 200gm	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
242	6	72	Tibet Detergent Powder 500gm	tibet-detergent-powder-500gm	Tibet Detergent Powder 500gm	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
243	6	72	Tibet Detergent Powder 1kg	tibet-detergent-powder-1kg	Tibet Detergent Powder 1kg	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
244	6	72	Tibet Detergent Powder 2kg	tibet-detergent-powder-2kg	Tibet Detergent Powder 2kg	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
245	6	73	Joya Belt 5pcs	joya-belt-5pcs	Joya Belt 5pcs	5.00	5.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	35.00	\N	\N
246	6	73	Joya Belt 8pcs	joya-belt-8pcs	Joya Belt 8pcs	15.00	15.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	60.00	\N	\N
247	6	73	Joya Belt 15pcs	joya-belt-15pcs	Joya Belt 15pcs	25.00	25.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	110.00	\N	\N
248	6	73	Joya Penty 5Pcs	joya-penty-5pcs	Joya Penty 5Pcs	10.00	10.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	40.00	\N	\N
249	6	73	Joya Penty 10pcs	joya-penty-10pcs	Joya Penty 10pcs	20.00	20.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	80.00	\N	\N
250	6	75	Aci Salt - 1Kg	aci-salt-1kg-1	Aci Salt - 1Kg	42.00	42.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	38.00	\N	\N
251	6	75	Aci Salt jar - 750gm	aci-salt-jar-750gm-1	Aci Salt jar - 750gm	60.00	60.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	52.00	\N	\N
252	6	75	Aci Salt - 500gm	aci-salt-500gm-1	Aci Salt - 500gm	22.00	22.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	19.50	\N	\N
253	6	76	Basundhara Soyabin Oil - 1L	basundhara-soyabin-oil-1l-1	Basundhara Soyabin Oil - 1L	3.00	3.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	199.00	\N	\N
254	6	76	Basundhara Soyabin Oil 2L	basundhara-soyabin-oil-2l-1	Basundhara Soyabin Oil 2L	6.00	6.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	398.00	\N	\N
255	6	76	Aci Pure Soyabin Oil - 1L	aci-pure-soyabin-oil-1l-1	Aci Pure Soyabin Oil - 1L	1.00	1.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	199.00	\N	\N
256	6	76	Pure Soyabin Oil 5L	pure-soyabin-oil-5l-1	Pure Soyabin Oil 5L	5.00	5.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	975.00	\N	\N
257	6	76	Pure Soyabin Oil Teer Soyabin - 250 ml	pure-soyabin-oil-teer-soyabin-250-ml	Pure Soyabin Oil Teer Soyabin - 250 ml	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
258	6	76	Pure Soyabin Oil Teer Soyabin - 1L poly	pure-soyabin-oil-teer-soyabin-1l-poly	Pure Soyabin Oil Teer Soyabin - 1L poly	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
259	6	76	Pure Soyabin Oil Teer Soyabin bottle - 500ml	pure-soyabin-oil-teer-soyabin-bottle-500ml	Pure Soyabin Oil Teer Soyabin bottle - 500ml	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
260	6	76	Pure Soyabin Oil Teer Soyabin - 2 L	pure-soyabin-oil-teer-soyabin-2-l	Pure Soyabin Oil Teer Soyabin - 2 L	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
261	6	76	Pure Soyabin Oil Teer Soyabin - 3 L	pure-soyabin-oil-teer-soyabin-3-l	Pure Soyabin Oil Teer Soyabin - 3 L	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
262	6	76	Pure Soyabin Oil Teer Soyabin - 5L	pure-soyabin-oil-teer-soyabin-5l	Pure Soyabin Oil Teer Soyabin - 5L	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
263	6	76	Pure Soyabin Oil Teer Soyabin - 8L	pure-soyabin-oil-teer-soyabin-8l	Pure Soyabin Oil Teer Soyabin - 8L	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
264	6	76	Pure Soyabin Oil Teer Masturd Oil - 80 ml	pure-soyabin-oil-teer-masturd-oil-80-ml	Pure Soyabin Oil Teer Masturd Oil - 80 ml	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
265	6	76	Pure Soyabin Oil Teer Masturd Oil - 250 Ml	pure-soyabin-oil-teer-masturd-oil-250-ml	Pure Soyabin Oil Teer Masturd Oil - 250 Ml	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
266	6	76	Pure Soyabin Oil Teer Masturd Oil - 500ML	pure-soyabin-oil-teer-masturd-oil-500ml	Pure Soyabin Oil Teer Masturd Oil - 500ML	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
267	6	76	Pure Soyabin Oil Teer Masturd Oil - 1L	pure-soyabin-oil-teer-masturd-oil-1l	Pure Soyabin Oil Teer Masturd Oil - 1L	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
268	6	76	Pure Soyabin Oil Teer Muri - 250gm	pure-soyabin-oil-teer-muri-250gm	Pure Soyabin Oil Teer Muri - 250gm	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
269	6	76	Pure Soyabin Oil Teer Muri - 500gm	pure-soyabin-oil-teer-muri-500gm	Pure Soyabin Oil Teer Muri - 500gm	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
270	6	76	Pure Soyabin Oil Suger teer - 1KG	pure-soyabin-oil-suger-teer-1kg	Pure Soyabin Oil Suger teer - 1KG	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
271	6	76	Pure Soyabin Oil Teer Nazirshal Chal - 5 kg	pure-soyabin-oil-teer-nazirshal-chal-5-kg	Pure Soyabin Oil Teer Nazirshal Chal - 5 kg	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
272	6	76	Pure Soyabin Oil Teer Katarivog - 5Kg	pure-soyabin-oil-teer-katarivog-5kg	Pure Soyabin Oil Teer Katarivog - 5Kg	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
273	6	76	Pure Soyabin Oil Teer Katarivog - 25 Kg	pure-soyabin-oil-teer-katarivog-25-kg	Pure Soyabin Oil Teer Katarivog - 25 Kg	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
274	6	76	Pure Soyabin Oil Teer Mashur dal - 1 Kg	pure-soyabin-oil-teer-mashur-dal-1-kg	Pure Soyabin Oil Teer Mashur dal - 1 Kg	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
276	6	76	Pure Soyabin Oil Teer Nataral 1L  (Boottle)	pure-soyabin-oil-teer-nataral-1l-boottle	Pure Soyabin Oil Teer Nataral 1L  (Boottle)	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
280	6	76	Pure Soyabin Oil Teer Nataral 500 ML  (Boottle)	pure-soyabin-oil-teer-nataral-500-ml-boottle-4	Pure Soyabin Oil Teer Nataral 500 ML  (Boottle)	0.00	0.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
281	6	77	Aci Pure Suzi - 500gm	aci-pure-suzi-500gm-1	Aci Pure Suzi - 500gm	48.00	48.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	35.00	\N	\N
282	6	77	Aci Pure Suzi - 250gm	aci-pure-suzi-250gm-1	Aci Pure Suzi - 250gm	25.00	25.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	18.00	\N	\N
283	6	78	SQUARE - SunflowerOil	square-sunfloweroil	SQUARE - SunflowerOil	420.00	420.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	0.00	\N	\N
284	6	78	2 Ltr	2-ltr	2 Ltr	135.00	135.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	975.00	\N	\N
285	6	78	5 Ltr	5-ltr	5 Ltr	335.00	335.00	\N	100	\N	\N	f	published	0	2026-07-29 08:49:04	2026-07-29 08:49:04	\N	2350.00	\N	\N
\.


--
-- Data for Name: promo_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promo_codes (id, code, type, value, min_order_amount, max_discount, usage_limit, used_count, starts_at, expires_at, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: promotion_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_rules (id, name, trigger_product_id, trigger_quantity, free_product_id, free_quantity, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: q_a_s; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.q_a_s (id, product_id, user_id, name, question, answer, is_answered, is_published, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, product_id, user_id, name, rating, title, content, is_verified_purchase, is_published, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
TtxMAL5YYa1sBH7EuDuPk9eG0CrFZduzt4lWEIFU	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiNWtqNnd3OGdLYlJNZXoxb3BtWmFtaUNyb3ROUVhrYnViU1ZsT3UzWCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1780141322
KzHtMBe8KxgEJnwh1sPP82sZsRnbOvMjEcagyog0	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiZUNqbU1KU2djWHBQR0ZKSVI2cWRmVEJCNDA5TVFDakFuM0pQNTlreSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1780155356
hpZYVEwRWshzlhr05zyoZNJfv6GDjVJJG4hKS1Mq	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.122.1 Chrome/142.0.7444.265 Electron/39.8.8 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiVUhyd1d1VXVLUlV4MFQyNkFkOEtjUUg0WjB0RzRvMjVaU2w2bUZ1NCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1780486814
mXAUAD69JcvhcO5nDSPjCYziD3WkjuKI5ZhAdKh6	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiNWtJTGNCZ2pmekFQb2xoM2Ewa3V6UVFJNm9iM2psaXpubXVYcU5NVSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1781187750
aZAtc0OdsjTuT0ezSA0hWtBW8w77B2Iig80TqL7m	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiTExXV0Z6TXVlc3VmSWZGcHRRb1V5S3ExcFR2NTA1UUhrTUVSVks5cCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1781702628
AYCBGrkuCiTKbpEo3ZtsR4NmVFNszrIQcHDV5Kpm	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiZnlHTnRIWUU4WVA3emhMb3NkdWNiZEd5VUswdDRJNXFTOFlLbXB1RyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1781785782
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (key, value, created_at, updated_at) FROM stdin;
site_name	Future Shop	2026-06-09 06:53:13	2026-06-09 06:53:13
site_tagline	বাজারে নয়, বাজার আসবে আপনার ঘরে।	2026-06-09 06:53:13	2026-06-09 06:53:13
contact_phone	\N	2026-06-09 06:53:13	2026-06-09 06:53:13
contact_email	\N	2026-06-09 06:53:13	2026-06-09 06:53:13
contact_address	\N	2026-06-09 06:53:13	2026-06-09 06:53:13
\.


--
-- Data for Name: social_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.social_accounts (id, user_id, provider, provider_id, created_at, updated_at) FROM stdin;
1	22	google	106283137693669504465	2026-06-25 11:36:46	2026-06-25 11:36:46
2	23	google	117715088548699956925	2026-06-27 05:40:22	2026-06-27 05:40:22
3	20	google	117252216698094931501	2026-07-02 10:33:26	2026-07-02 10:33:26
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, order_id, vendor_id, reference, payment_method, type, amount, status, gateway_response, created_at, updated_at) FROM stdin;
4	6	\N	COD-FS-2026-00006	cod	payment	1540.00	pending	\N	2026-06-28 06:15:34	2026-06-28 06:15:34
5	6	\N	CODCOLLECT-FS-2026-00006	cod	payment	1540.00	completed	\N	2026-06-28 06:19:02	2026-06-28 06:19:02
3	5	\N	COD-FS-2026-00005	cod	payment	85.00	failed	\N	2026-06-27 05:41:32	2026-07-04 03:47:49
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, email_verified_at, password, phone, avatar, is_active, remember_token, created_at, updated_at, role, referral_code, referred_by_id) FROM stdin;
12	Sherpur Bazaar Store	vendor@localbazaar.com	\N	$2y$12$sYzS8Ervovr9SMDNnyI33.E5dkfkrWuVH5JA5NsMawxC2ApE/qrN6	01710000001	\N	t	\N	2026-05-30 15:46:46	2026-05-30 15:46:46	vendor	\N	\N
1	Admin	admin@futureshop.com	2026-05-31 09:34:46	$2y$12$8ahd9fXE3oX66L.0BtxZQum8Va.c2BmKfF2WSFv3gALB0pfrflh4W	01700000000	\N	t	\N	2026-05-30 05:56:21	2026-06-02 11:43:56	admin	\N	\N
15	Test Customer	\N	\N	$2y$12$jSlqsWFYwGwmDdFJNgM7z.3wqVG9VfiYCqbfR9GIrSXCQqk2ngN72	01700000001	\N	t	\N	2026-06-11 07:32:25	2026-06-11 07:32:25	customer	Z5RLBNSU	\N
16	Future Shop User	\N	\N	\N	01900000099	\N	t	\N	2026-06-13 05:47:35	2026-06-13 05:47:35	customer	GPY8LUSN	\N
17	admin@futureshop.com	\N	\N	$2y$12$aUjriFYTSfj4Afijy0cR1OVcn4Pgz0ICVwAcfSlIfugGeKvafRCom	01500000033	\N	t	\N	2026-06-13 05:55:43	2026-06-13 05:55:43	customer	TLZYWNAE	16
18	TEST Staff Throwaway	staff_test_throwaway@futureshop.test	\N	$2y$12$cq2ffwGM3J/Kp7A2ksiZJOIr7W6JUV0imrOIoBo8IHT5E5OxEsNUC	01999000001	\N	f	\N	2026-06-18 12:33:26	2026-06-18 12:34:50	staff	WRXM2AET	\N
19	TEST Vendor Owner Throwaway	vendorowner_test_throwaway@futureshop.test	\N	$2y$12$5uJPesW030nAFboe70hCaeLWHC8VcnMWJeRFiJ0PpCyl/NeIyfPby	01999000002	\N	f	\N	2026-06-18 12:33:27	2026-06-18 12:34:51	vendor	JPC5SAV3	\N
21	Abul Khair	khairabm@gmail.com	\N	$2y$12$W7kx0vVdnhS28mQ1orgLJeDdHRle.fPNzJcQN8Q6.m5kA8q0WMsZC	01711220000	\N	t	\N	2026-06-25 08:06:49	2026-06-25 08:06:49	customer	KHFMNW3R	\N
22	Sadia Iqbal	ama45410@gmail.com	\N	$2y$12$j0fmB7fLEW8kcwe2Mwiq.OnpTwPOSZBnbF.vg4X.6Py7v6tWkpmeC	\N	\N	t	\N	2026-06-25 11:36:46	2026-06-25 11:36:46	customer	Z3P5T28Q	\N
23	Ashraful Alam Ashik (Future Minds Academy)	ashik.fuminds@gmail.com	\N	$2y$12$1Iw5f/IRFqYJzUukW5MZO.FywMx1Fzt/JdZbI4RQrOG.TYCLKb36G	\N	\N	t	\N	2026-06-27 05:40:22	2026-06-27 05:40:22	customer	Q8BCU7P4	\N
13	Karim Delivery	karim.delivery@futureshop.com	\N	$2y$12$BYLl0XOqIB4ydzj2QTrkYuPURhNXMcptDwj1KRpSMoH0c5e6U4nVO	01911111111	\N	t	\N	2026-06-02 11:16:03	2026-06-28 06:11:33	delivery	\N	\N
20	Ibrahim Hossain	futuremindsbd.info@gmail.com	\N	\N	01717423930	\N	t	\N	2026-06-22 05:41:26	2026-07-02 10:34:36	vendor	UJGESXTD	\N
26	test	test@futureshop.com	\N	$2y$12$X7FxzmphxSVCO3dxVlMyxu.ctHXcZ8lm2JWKq.1yoe63FyyoIXfF2	017001000000	\N	t	\N	2026-07-04 04:55:32	2026-07-04 04:55:32	customer	RHCYANL8	\N
27	test staff	staff@futureshop.com	\N	$2y$12$KV/dEdIW1RCFU1HLGovkBusXm7dCH8dJJtZs98JKFiedmsQcU89.y	01234567890	\N	t	\N	2026-07-04 04:59:08	2026-07-04 08:32:40	staff	8JMDHYQB	\N
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, user_id, shop_name, slug, description, logo, banner, phone, address, division, district, commission_rate, status, is_active, created_at, updated_at, delivery_zone_id, proprietor_name, sr_name, sr_mobile) FROM stdin;
6	12	Future Shop	sherpur-bazaar-store	\N	\N	\N	\N	\N	\N	\N	0.00	approved	t	2026-05-30 15:46:46	2026-06-20 11:02:36	\N	\N	\N	\N
8	20	Abdullah Traders	abdullah-traders	\N	\N	\N	01717423930	Sherpur	Rajshahi	Bogura	10.00	approved	t	2026-06-22 05:41:26	2026-06-22 05:41:26	\N	Rezaul Karim	Somrat	\N
\.


--
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallet_transactions (id, user_id, type, amount, description, reference, balance_after, created_at) FROM stdin;
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallets (id, user_id, balance, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlists (id, user_id, product_id, created_at, updated_at) FROM stdin;
\.


--
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.addresses_id_seq', 1, true);


--
-- Name: banners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banners_id_seq', 1, false);


--
-- Name: brand_vendor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.brand_vendor_id_seq', 3, true);


--
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.brands_id_seq', 10, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 78, true);


--
-- Name: coupon_usages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupon_usages_id_seq', 1, false);


--
-- Name: coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupons_id_seq', 5, true);


--
-- Name: delivery_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.delivery_zones_id_seq', 3, true);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 45, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 8, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 11, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 117, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 285, true);


--
-- Name: promo_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promo_codes_id_seq', 1, false);


--
-- Name: promotion_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotion_rules_id_seq', 1, false);


--
-- Name: q_a_s_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.q_a_s_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: social_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.social_accounts_id_seq', 3, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 28, true);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendors_id_seq', 8, true);


--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wallet_transactions_id_seq', 1, false);


--
-- Name: wallets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wallets_id_seq', 1, false);


--
-- Name: wishlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wishlists_id_seq', 1, false);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: brand_vendor brand_vendor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_vendor
    ADD CONSTRAINT brand_vendor_pkey PRIMARY KEY (id);


--
-- Name: brand_vendor brand_vendor_vendor_id_brand_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_vendor
    ADD CONSTRAINT brand_vendor_vendor_id_brand_id_unique UNIQUE (vendor_id, brand_id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: brands brands_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_slug_unique UNIQUE (slug);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: coupon_usages coupon_usages_coupon_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_coupon_id_user_id_unique UNIQUE (coupon_id, user_id);


--
-- Name: coupon_usages coupon_usages_order_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_order_id_unique UNIQUE (order_id);


--
-- Name: coupon_usages coupon_usages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_unique UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: delivery_zones delivery_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_zones
    ADD CONSTRAINT delivery_zones_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);


--
-- Name: orders orders_payment_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_payment_code_unique UNIQUE (payment_code);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_unique UNIQUE (sku);


--
-- Name: products products_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_unique UNIQUE (slug);


--
-- Name: promo_codes promo_codes_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_code_unique UNIQUE (code);


--
-- Name: promo_codes promo_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_pkey PRIMARY KEY (id);


--
-- Name: promotion_rules promotion_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rules
    ADD CONSTRAINT promotion_rules_pkey PRIMARY KEY (id);


--
-- Name: q_a_s q_a_s_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.q_a_s
    ADD CONSTRAINT q_a_s_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: social_accounts social_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_pkey PRIMARY KEY (id);


--
-- Name: social_accounts social_accounts_provider_provider_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_provider_provider_id_unique UNIQUE (provider, provider_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_reference_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_reference_unique UNIQUE (reference);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_phone_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_unique UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_referral_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referral_code_unique UNIQUE (referral_code);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_slug_unique UNIQUE (slug);


--
-- Name: vendors vendors_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_user_id_unique UNIQUE (user_id);


--
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: wallet_transactions wallet_transactions_reference_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_reference_unique UNIQUE (reference);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_unique UNIQUE (user_id);


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_user_id_product_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_product_id_unique UNIQUE (user_id, product_id);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: orders_coupon_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_coupon_id_index ON public.orders USING btree (coupon_id);


--
-- Name: orders_promo_code_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_promo_code_id_index ON public.orders USING btree (promo_code_id);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: products_brand_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_brand_id_index ON public.products USING btree (brand_id);


--
-- Name: products_vendor_id_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_vendor_id_status_index ON public.products USING btree (vendor_id, status);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: users_referred_by_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_referred_by_id_index ON public.users USING btree (referred_by_id);


--
-- Name: wallet_transactions_user_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wallet_transactions_user_id_created_at_index ON public.wallet_transactions USING btree (user_id, created_at);


--
-- Name: addresses addresses_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: brand_vendor brand_vendor_brand_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_vendor
    ADD CONSTRAINT brand_vendor_brand_id_foreign FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;


--
-- Name: brand_vendor brand_vendor_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_vendor
    ADD CONSTRAINT brand_vendor_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: coupon_usages coupon_usages_coupon_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_coupon_id_foreign FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE CASCADE;


--
-- Name: coupon_usages coupon_usages_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: coupon_usages coupon_usages_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: order_items order_items_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE RESTRICT;


--
-- Name: orders orders_coupon_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_coupon_id_foreign FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE SET NULL;


--
-- Name: orders orders_delivery_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_delivery_user_id_foreign FOREIGN KEY (delivery_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: orders orders_delivery_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_delivery_zone_id_foreign FOREIGN KEY (delivery_zone_id) REFERENCES public.delivery_zones(id) ON DELETE SET NULL;


--
-- Name: orders orders_promo_code_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_promo_code_id_foreign FOREIGN KEY (promo_code_id) REFERENCES public.promo_codes(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: products products_brand_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_foreign FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: products products_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: products products_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: promotion_rules promotion_rules_free_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rules
    ADD CONSTRAINT promotion_rules_free_product_id_foreign FOREIGN KEY (free_product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: promotion_rules promotion_rules_trigger_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rules
    ADD CONSTRAINT promotion_rules_trigger_product_id_foreign FOREIGN KEY (trigger_product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: q_a_s q_a_s_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.q_a_s
    ADD CONSTRAINT q_a_s_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: q_a_s q_a_s_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.q_a_s
    ADD CONSTRAINT q_a_s_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: social_accounts social_accounts_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;


--
-- Name: users users_referred_by_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referred_by_id_foreign FOREIGN KEY (referred_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vendors vendors_delivery_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_delivery_zone_id_foreign FOREIGN KEY (delivery_zone_id) REFERENCES public.delivery_zones(id) ON DELETE SET NULL;


--
-- Name: vendors vendors_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wallet_transactions wallet_transactions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wallets wallets_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Y6vMabyy8zBoAWNhtlh9hEPCE77pwbdYeMxsGX1fgSQt3O8WH9MgPW848NMVeu0

