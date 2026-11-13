--
-- PostgreSQL database dump
--

\restrict uNAcLLenADb7M3yb5NFIHjE0VjN72f5uP2fNbQSN7EI8uVEefG2mluikTi3MMAH

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-13 17:49:33

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
-- TOC entry 229 (class 1259 OID 16457)
-- Name: appointment_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment_services (
    appointment_id integer NOT NULL,
    service_id integer NOT NULL,
    price_at_moment numeric(10,2) NOT NULL
);


ALTER TABLE public.appointment_services OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16438)
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    appointment_id integer NOT NULL,
    client_id integer,
    barber_id integer,
    appointment_date timestamp without time zone NOT NULL,
    status character varying(50) DEFAULT 'Заплановано'::character varying,
    total_cost numeric(10,2),
    client_comment text DEFAULT 'Немає побажань'::text
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16437)
-- Name: appointments_appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_appointment_id_seq OWNER TO postgres;

--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 227
-- Name: appointments_appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_appointment_id_seq OWNED BY public.appointments.appointment_id;


--
-- TOC entry 222 (class 1259 OID 16398)
-- Name: barbers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.barbers (
    barber_id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    phone character varying(20) NOT NULL,
    specialization character varying(200),
    photo character varying(255)
);


ALTER TABLE public.barbers OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16397)
-- Name: barbers_barber_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.barbers_barber_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.barbers_barber_id_seq OWNER TO postgres;

--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 221
-- Name: barbers_barber_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.barbers_barber_id_seq OWNED BY public.barbers.barber_id;


--
-- TOC entry 231 (class 1259 OID 16481)
-- Name: client_review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_review (
    review_id integer NOT NULL,
    client_id integer,
    barber_id integer,
    appointment_id integer,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT client_review_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.client_review OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16480)
-- Name: client_review_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_review_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_review_review_id_seq OWNER TO postgres;

--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 230
-- Name: client_review_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_review_review_id_seq OWNED BY public.client_review.review_id;


--
-- TOC entry 220 (class 1259 OID 16385)
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    client_id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(100)
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16384)
-- Name: clients_client_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clients_client_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_client_id_seq OWNER TO postgres;

--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 219
-- Name: clients_client_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clients_client_id_seq OWNED BY public.clients.client_id;


--
-- TOC entry 232 (class 1259 OID 16510)
-- Name: future_appointments_with_clients; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.future_appointments_with_clients AS
 SELECT a.appointment_id,
    a.appointment_date,
    (((c.first_name)::text || ' '::text) || (c.last_name)::text) AS client_name,
    c.phone AS client_phone,
    c.email AS client_email,
    (((b.first_name)::text || ' '::text) || (b.last_name)::text) AS barber_name,
    a.status
   FROM ((public.appointments a
     JOIN public.clients c ON ((a.client_id = c.client_id)))
     JOIN public.barbers b ON ((a.barber_id = b.barber_id)))
  WHERE (a.appointment_date > CURRENT_TIMESTAMP);


ALTER VIEW public.future_appointments_with_clients OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16516)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    payment_id integer NOT NULL,
    appointment_id integer,
    amount numeric(10,2) NOT NULL,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payment_status character varying(50) NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16515)
-- Name: payments_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_payment_id_seq OWNER TO postgres;

--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 233
-- Name: payments_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_payment_id_seq OWNED BY public.payments.payment_id;


--
-- TOC entry 224 (class 1259 OID 16411)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    service_id integer NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    duration_min integer NOT NULL
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16410)
-- Name: services_service_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_service_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_service_id_seq OWNER TO postgres;

--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 223
-- Name: services_service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_service_id_seq OWNED BY public.services.service_id;


--
-- TOC entry 226 (class 1259 OID 16422)
-- Name: work_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_schedules (
    schedule_id integer NOT NULL,
    barber_id integer,
    work_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL
);


ALTER TABLE public.work_schedules OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16421)
-- Name: work_schedules_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_schedules_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_schedules_schedule_id_seq OWNER TO postgres;

--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 225
-- Name: work_schedules_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_schedules_schedule_id_seq OWNED BY public.work_schedules.schedule_id;


--
-- TOC entry 4898 (class 2604 OID 16545)
-- Name: appointments appointment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN appointment_id SET DEFAULT nextval('public.appointments_appointment_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 16546)
-- Name: barbers barber_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barbers ALTER COLUMN barber_id SET DEFAULT nextval('public.barbers_barber_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 16547)
-- Name: client_review review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_review ALTER COLUMN review_id SET DEFAULT nextval('public.client_review_review_id_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 16548)
-- Name: clients client_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients ALTER COLUMN client_id SET DEFAULT nextval('public.clients_client_id_seq'::regclass);


--
-- TOC entry 4903 (class 2604 OID 16549)
-- Name: payments payment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN payment_id SET DEFAULT nextval('public.payments_payment_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 16550)
-- Name: services service_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN service_id SET DEFAULT nextval('public.services_service_id_seq'::regclass);


--
-- TOC entry 4897 (class 2604 OID 16551)
-- Name: work_schedules schedule_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_schedules ALTER COLUMN schedule_id SET DEFAULT nextval('public.work_schedules_schedule_id_seq'::regclass);


--
-- TOC entry 5095 (class 0 OID 16457)
-- Dependencies: 229
-- Data for Name: appointment_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment_services (appointment_id, service_id, price_at_moment) FROM stdin;
2	1	500.00
3	1	500.00
10	1	500.00
12	1	500.00
13	2	450.00
14	13	700.00
14	14	450.00
\.


--
-- TOC entry 5094 (class 0 OID 16438)
-- Dependencies: 228
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (appointment_id, client_id, barber_id, appointment_date, status, total_cost, client_comment) FROM stdin;
12	1	1	2026-10-29 12:00:00	Заплановано	500.00	Немає побажань
3	3	3	2026-10-27 12:00:00	Заплановано	750.00	Немає побажань
2	2	2	2026-10-25 11:30:00	Виконано	500.00	Немає побажань
10	13	1	2026-10-27 14:00:00	Скасовано	500.00	Покоротше з боків
14	15	12	2026-10-31 13:00:00	Виконано	1150.00	Немає побажань
13	2	2	2026-10-30 15:00:00	Виконано	450.00	Зробити контур
\.


--
-- TOC entry 5088 (class 0 OID 16398)
-- Dependencies: 222
-- Data for Name: barbers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.barbers (barber_id, first_name, last_name, phone, specialization, photo) FROM stdin;
1	Іван	Борода	+380509998877	Класичні стрижки та небезпечне гоління	/photos/b1.jpg
3	Сергій	Трим	+380972223344	Моделювання бороди та стрижка машинкою	/photos/b3.jpg
12	Андрій	Шевченко	+380933334455	Тоp-барбер	/photos/b12.jpg
13	Іван	Мельник	+380634445566	Барбер-стиліст	/photos/b13.jpg
2	Дмитро	Потужний	+380635554433	Сучасні чоловічі стрижки, Fade	/photos/b2.jpg
\.


--
-- TOC entry 5097 (class 0 OID 16481)
-- Dependencies: 231
-- Data for Name: client_review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_review (review_id, client_id, barber_id, appointment_id, rating, comment, created_at) FROM stdin;
2	\N	\N	2	5	Швидко, якісно та ввічливо. Обов`язково повернуся ще.	2026-10-23 22:56:31.564712
3	\N	\N	3	4	Загалом усе сподобалося, але довелося зачекати пару хвилин.	2026-10-23 22:56:31.564712
4	\N	\N	10	5	Преміум сервіс на вищому рівні, стрижка ідеальна!	2026-10-23 22:56:31.564712
5	\N	\N	2	5	Чудовий сервіс, все дуже сподобалося!	2026-10-24 14:21:56.083685
\.


--
-- TOC entry 5086 (class 0 OID 16385)
-- Dependencies: 220
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (client_id, first_name, last_name, phone, email) FROM stdin;
2	Максим	Коваленко	+380671112233	koval@ukr.net
3	Андрій	Шевченко	+380937778899	shevchenko@gmail.com
13	Олександр	Петренко	+380501112233	oleksandr@gmail.com
14	Марія	Коваленко	+380672223344	maria@gmail.com
1	Олександр	Кураш	+380501234567	petrenko@gmail.com
15	Петро	Вула	+380987654321	petya@gmail.com
\.


--
-- TOC entry 5099 (class 0 OID 16516)
-- Dependencies: 234
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (payment_id, appointment_id, amount, payment_date, payment_status) FROM stdin;
3	14	1150.00	2026-11-03 13:08:02.205692	оплачено
4	13	450.00	2026-11-12 11:43:16.436712	оплачено
\.


--
-- TOC entry 5090 (class 0 OID 16411)
-- Dependencies: 224
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (service_id, name, price, duration_min) FROM stdin;
1	Чоловіча стрижка	500.00	45
2	Стрижка бороди	300.00	30
3	Комплекс (Стрижка + Борода)	750.00	75
4	Гоління небезпечною бритвою	400.00	30
13	Преміум чоловіча стрижка	700.00	60
14	Преміум догляд за бородою	450.00	40
\.


--
-- TOC entry 5092 (class 0 OID 16422)
-- Dependencies: 226
-- Data for Name: work_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_schedules (schedule_id, barber_id, work_date, start_time, end_time) FROM stdin;
1	1	2026-10-25	09:00:00	18:00:00
2	2	2026-10-25	10:00:00	19:00:00
3	3	2026-10-26	09:00:00	17:00:00
12	1	2026-10-27	10:00:00	20:00:00
13	2	2026-10-28	11:00:00	19:00:00
14	2	2026-11-27	09:00:00	20:00:00
15	13	2026-10-23	09:00:00	20:00:00
\.


--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 227
-- Name: appointments_appointment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_appointment_id_seq', 14, true);


--
-- TOC entry 5113 (class 0 OID 0)
-- Dependencies: 221
-- Name: barbers_barber_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.barbers_barber_id_seq', 13, true);


--
-- TOC entry 5114 (class 0 OID 0)
-- Dependencies: 230
-- Name: client_review_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_review_review_id_seq', 6, true);


--
-- TOC entry 5115 (class 0 OID 0)
-- Dependencies: 219
-- Name: clients_client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_client_id_seq', 15, true);


--
-- TOC entry 5116 (class 0 OID 0)
-- Dependencies: 233
-- Name: payments_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_payment_id_seq', 4, true);


--
-- TOC entry 5117 (class 0 OID 0)
-- Dependencies: 223
-- Name: services_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_service_id_seq', 14, true);


--
-- TOC entry 5118 (class 0 OID 0)
-- Dependencies: 225
-- Name: work_schedules_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_schedules_schedule_id_seq', 15, true);


--
-- TOC entry 4923 (class 2606 OID 16464)
-- Name: appointment_services appointment_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_pkey PRIMARY KEY (appointment_id, service_id);


--
-- TOC entry 4919 (class 2606 OID 16446)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (appointment_id);


--
-- TOC entry 4911 (class 2606 OID 16409)
-- Name: barbers barbers_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barbers
    ADD CONSTRAINT barbers_phone_key UNIQUE (phone);


--
-- TOC entry 4913 (class 2606 OID 16407)
-- Name: barbers barbers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barbers
    ADD CONSTRAINT barbers_pkey PRIMARY KEY (barber_id);


--
-- TOC entry 4925 (class 2606 OID 16491)
-- Name: client_review client_review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_review
    ADD CONSTRAINT client_review_pkey PRIMARY KEY (review_id);


--
-- TOC entry 4907 (class 2606 OID 16396)
-- Name: clients clients_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_phone_key UNIQUE (phone);


--
-- TOC entry 4909 (class 2606 OID 16394)
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (client_id);


--
-- TOC entry 4927 (class 2606 OID 16525)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- TOC entry 4915 (class 2606 OID 16420)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (service_id);


--
-- TOC entry 4921 (class 2606 OID 16509)
-- Name: appointments unique_barber_time; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT unique_barber_time UNIQUE (barber_id, appointment_date);


--
-- TOC entry 4917 (class 2606 OID 16431)
-- Name: work_schedules work_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_schedules
    ADD CONSTRAINT work_schedules_pkey PRIMARY KEY (schedule_id);


--
-- TOC entry 4931 (class 2606 OID 16465)
-- Name: appointment_services appointment_services_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id) ON DELETE CASCADE;


--
-- TOC entry 4932 (class 2606 OID 16470)
-- Name: appointment_services appointment_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(service_id) ON DELETE CASCADE;


--
-- TOC entry 4929 (class 2606 OID 16540)
-- Name: appointments appointments_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(barber_id) ON DELETE SET NULL;


--
-- TOC entry 4930 (class 2606 OID 16447)
-- Name: appointments appointments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(client_id) ON DELETE CASCADE;


--
-- TOC entry 4933 (class 2606 OID 16502)
-- Name: client_review client_review_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_review
    ADD CONSTRAINT client_review_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id) ON DELETE CASCADE;


--
-- TOC entry 4934 (class 2606 OID 16497)
-- Name: client_review client_review_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_review
    ADD CONSTRAINT client_review_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(barber_id) ON DELETE CASCADE;


--
-- TOC entry 4935 (class 2606 OID 16492)
-- Name: client_review client_review_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_review
    ADD CONSTRAINT client_review_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(client_id) ON DELETE CASCADE;


--
-- TOC entry 4936 (class 2606 OID 16526)
-- Name: payments payments_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id);


--
-- TOC entry 4928 (class 2606 OID 16432)
-- Name: work_schedules work_schedules_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_schedules
    ADD CONSTRAINT work_schedules_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(barber_id) ON DELETE CASCADE;


-- Completed on 2026-11-13 17:49:33

--
-- PostgreSQL database dump complete
--

\unrestrict uNAcLLenADb7M3yb5NFIHjE0VjN72f5uP2fNbQSN7EI8uVEefG2mluikTi3MMAH

