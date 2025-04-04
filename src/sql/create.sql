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
)