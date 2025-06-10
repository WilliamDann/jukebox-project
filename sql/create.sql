-- create the schema if it doesn't exist
create schema if not exists jukeboxdb;

-- switch to the schema (in PostgreSQL you set the search_path)
set search_path to jukeboxdb;

-- table storing user accounts
create table if not exists accounts (
    id serial primary key,
    email varchar(255) unique not null,
    displayName varchar(255) not null,
    passwordHash varchar(255) not null
);

-- table storing access tokens to our application
-- this is not access tokens to spotify
create table if not exists accessTokens (
    accessToken varchar(255) primary key,
    accountId int not null references accounts(id)
);

-- a user profile belongs to a user under an account who has connected their spotify
create table if not exists profiles (
    id serial primary key,
    displayName varchar(255) not null,
    accountId int not null references accounts(id),
    active boolean not null default false,
    spotAuthToken varchar(999)
);

-- a spotify access token is what allows us to take actions on a user's behalf
-- they are generated when we need them and expire after some time
create table if not exists spotifyAccessTokens (
    access_token varchar(999) primary key,
    refresh_token varchar(999) not null,
    expires_in int not null,
    scope varchar(999) not null,
    profileId int not null references profiles(id),
    generatedAt bigint not null
);