create table soft_delete(
  is_delete boolean not null default false
);

create table time_log(
  create_time timestamp not null default now(),
  update_time timestamp
);


create table users (
  id uuid primary  key  default gen_random_uuid(),
  username varchar(50) unique not null,
  email varchar(50) unique not null,
  avatar text,
  password varchar(255),
  role varchar(20) not null default 'user'
) inherits (soft_delete, time_log);

create table posts (
  id uuid primary key default gen_random_uuid(),
  title varchar(100) not null, 
  content text
) inherits (soft_delete, time_log);

create table likes(
  user_id uuid,
  post_id uuid,
  create_time timestamp not null default now(),
  primary key (user_id, post_id),
  foreign key (user_id) references users(id),
  foreign key (post_id) references posts(id)
);

create table reposts(
  user_id uuid,
  post_id uuid,
  primary key (user_id, post_id),
  foreign key (user_id) references users(id),
  foreign key (post_id) references posts(id)
);

create table comments (
  user_id uuid,
  post_id uuid,
  cotent text,
  primary key (user_id, post_id),
  foreign key (user_id) references users(id),
  foreign key (post_id) references posts(id)
) inherits (soft_delete, time_log);

create table audit_logs(
  id uuid not null primary key default gen_random_uuid(),
  action varchar(15) not null,
  entity_name varchar(30) not null,
  old_value text,
  new_value text,
  create_by uuid not null,
  create_time timestamp not null default now()
)




