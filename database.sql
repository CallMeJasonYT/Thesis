-- This script was generated by the ERD tool in pgAdmin 4.
-- Please log an issue at https://github.com/pgadmin-org/pgadmin4/issues/new/choose if you find any bugs, including reproduction steps.
BEGIN;


CREATE TABLE IF NOT EXISTS public.level_completion
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    username character varying(30) COLLATE pg_catalog."default" NOT NULL,
    completed boolean NOT NULL DEFAULT false,
    "time" integer,
    level_type level_type
);

CREATE TABLE IF NOT EXISTS public.tutorial_completion
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    username character varying(30) COLLATE pg_catalog."default" NOT NULL,
    checkpoint1 integer,
    checkpoint2 integer,
    checkpoint3 integer,
    checkpoint4 integer,
    finished boolean DEFAULT false,
    CONSTRAINT tutorial_completion_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public."user"
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    username character varying(30) COLLATE pg_catalog."default" NOT NULL,
    password character varying(16) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT usern UNIQUE (username)
);

ALTER TABLE IF EXISTS public.level_completion
    ADD CONSTRAINT level_comp_user FOREIGN KEY (username)
    REFERENCES public."user" (username) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.tutorial_completion
    ADD CONSTRAINT tutorial_user FOREIGN KEY (username)
    REFERENCES public."user" (username) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;