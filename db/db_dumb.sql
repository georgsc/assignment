--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4 (Debian 15.4-1.pgdg120+1)
-- Dumped by pg_dump version 16.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE postgres OWNER TO postgres;

\connect postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: KanbanColumn; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KanbanColumn" (
    id integer NOT NULL,
    name text
);


ALTER TABLE public."KanbanColumn" OWNER TO postgres;

--
-- Name: KanbanColumn_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KanbanColumn_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."KanbanColumn_id_seq" OWNER TO postgres;

--
-- Name: KanbanColumn_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KanbanColumn_id_seq" OWNED BY public."KanbanColumn".id;


--
-- Name: KanbanItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KanbanItem" (
    id integer NOT NULL,
    name text NOT NULL,
    done boolean DEFAULT false NOT NULL,
    "kanbanColumnId" integer NOT NULL
);


ALTER TABLE public."KanbanItem" OWNER TO postgres;

--
-- Name: KanbanItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KanbanItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."KanbanItem_id_seq" OWNER TO postgres;

--
-- Name: KanbanItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KanbanItem_id_seq" OWNED BY public."KanbanItem".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: KanbanColumn id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KanbanColumn" ALTER COLUMN id SET DEFAULT nextval('public."KanbanColumn_id_seq"'::regclass);


--
-- Name: KanbanItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KanbanItem" ALTER COLUMN id SET DEFAULT nextval('public."KanbanItem_id_seq"'::regclass);


--
-- Data for Name: KanbanColumn; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KanbanColumn" (id, name) FROM stdin;
1	ToDo
2	InProgress
3	Done
\.


--
-- Data for Name: KanbanItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KanbanItem" (id, name, done, "kanbanColumnId") FROM stdin;
1	Add Item	f	3
2	Move Item	f	3
3	Store in DB	f	3
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
020d7edb-0072-4f17-ac00-7b7819452d10	bfc9bc31f3d95ef00dd76a7934a202add83447bec7ed7da5fef6e0c4cbaad232	2023-09-15 10:24:36.426381+00	20230915102436_submission	\N	\N	2023-09-15 10:24:36.355956+00	1
\.


--
-- Name: KanbanColumn_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KanbanColumn_id_seq"', 3, true);


--
-- Name: KanbanItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KanbanItem_id_seq"', 3, true);


--
-- Name: KanbanColumn KanbanColumn_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KanbanColumn"
    ADD CONSTRAINT "KanbanColumn_pkey" PRIMARY KEY (id);


--
-- Name: KanbanItem KanbanItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KanbanItem"
    ADD CONSTRAINT "KanbanItem_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: KanbanItem KanbanItem_kanbanColumnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KanbanItem"
    ADD CONSTRAINT "KanbanItem_kanbanColumnId_fkey" FOREIGN KEY ("kanbanColumnId") REFERENCES public."KanbanColumn"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

