create schema if not exists jukeboxProject;
use jukeboxProject;

-- user accounts
create table if not exists accounts (
    id              int unique auto_increment,
    email           varchar(255) unique not null,
    passwordHash    varchar(255) not null,
    displayName     varchar(255) not null,

    primary key(id)
);

-- auth tokens for user sign-ins
create table if not exists tokens (
    token       varchar(255) unique not null,
    accountId   int not null,

    primary key(token),
    foreign key(accountId) references accounts(id)
);

-- a jukebox controls a spotify account's queue
create table if not exists jukeboxes (
    id              int unique auto_increment,
    ownerId         int not null,
    displayName     varchar(255) not null,
    spotifyAuthCode varchar(255) unique,

    primary key(id),
    foreign key(ownerId) references accounts(id)
);

-- spotify tokens
create table if not exists spotTokens (
    access_token    varchar(255) not null unique,

    jukeboxId       int not null,
    refresh_token   varchar(255),

    expires_in      int    not null,
    `generated`     bigint not null,

    primary key(access_token),
    foreign key(jukeboxId) references jukeboxes(id)
);