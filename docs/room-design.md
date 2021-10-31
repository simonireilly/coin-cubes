# Room Design

Authored: 2021-10-31

>Data structure design for open source roomservice.

- [Room Design](#room-design)
  - [Design Summary](#design-summary)
  - [Sockets](#sockets)
    - [Design](#design)
      - [Trade-off analysis](#trade-off-analysis)
  - [Access Patterns](#access-patterns)
    - [Room](#room)
      - [Create](#create)
      - [Join Room](#join-room)
      - [Get](#get)
      - [Leave Room](#leave-room)
      - [Delete](#delete)
    - [Presence](#presence)
      - [Create](#create-1)
      - [Get](#get-1)
      - [Upsert](#upsert)
      - [RemoveItem](#removeitem)
      - [Delete](#delete-1)
    - [Map](#map)
      - [Create](#create-2)
      - [Get](#get-2)
      - [Upsert](#upsert-1)
      - [RemoveItem](#removeitem-1)
      - [Delete](#delete-2)
    - [List](#list)

## Design Summary

Rooms are the root level data structure. All other structures belong to the room.

![Design of room service data](room-design.drawio.svg)

- Room
  - Presence
    - Hash map of userID - value pairs belonging to the room
    - Changes made locally then sent over the wire
    - Expires on disconnect from the room
      - Evict specific entry from the room on disconnect
      - Evict specific entry from the room after specified time
  - Map
    - Hash map of key-value pairs belonging to the room
    - Changes made locally then sent over the wire
    - You can set values inside the map, **it will not deep merge**
  - List
    - Ordered list of items belonging to the room
    - Changes made locally then sent over the wire


## Sockets

Each user, as a connectionId, their unique socket ID.

If the user is connected to the socket, then we should publish all changes to
that room down the socket.

So, we have to consider mapping sockets.

### Design

Each user has a connectionId. When the user sends their new data, we will also
get this connectionId.

#### Trade-off analysis

**Plan A**

We could store data against connectionId, but who is the owner, and how do we
many-to-many map connectionIds?

**Plan B**

We could store connectionIds in the room itself as a List. When we change data
we would need to send the updates to everyone, except the user who committed the
changes.

> User joins a room, and connectionId is added to list.
>
> User creates a Map, and the map data is published to all connectionIds except
>   the users because they have the most recent data.
>
> User leaves the room, and therefore connectionId is removed from room
>   connectionId List.

**PLan C**

Create member records so that we can store all connectionIds for a room in single
records.

```json
{
  "pk": "<roomID>",
  "sk": "MEMBER#<connectionId>",
  "connectionId": "<connectionId>"
}
```

When someone makes a change to a data structure, we then need to do a get, for
all connectionId records (or do them simultaneously with async *smart*).

Then for each person who is not this person, we need to push the changes to them.

This is easier than nesting the data inside the Room.

## Access Patterns

List of known access patterns

- Create room
- Get room
- Join room
- Delete room

- Create presence in room
- Get presence in room
- Add player to presence in room
- Remove player from presence in room
- Update player presence in room

- Add map to room
- Remove map from room
- Update map attribute in room

The primary key appears to be the room, everything needs to be accessed by that
attribute.

| Record Type | pk     | sk                      | Access pattern                          | MVP   |
| ----------- | ------ | ----------------------- | --------------------------------------- | ----- |
| Room        | roomId | ROOM                    | Create, Get, Delete                     | True  |
| Presence    | roomId | PRESENCE#<presenceName> | Create, Get, Upsert, RemoveItem, Delete | True  |
| Map         | roomId | MAP#<mapName>           | Create, Get, Upsert, Delete             | True  |
| List        | roomId | LIST#<listName>         | Create, Get, Upsert, Delete             | False |

### Room

The Room holds a list of connections to publish changes too.

```json
{
  "pk": "<roomId>",
  "sk": "ROOM",
  "connectionIds": [
    "131a1ef",
    "141a1ef"
  ]
}
```

#### Create

Insert room into table, roomId is uuid, putItem, ensure connectionIds is
populated with first connectionId of room creator.

#### Join Room

Authenticated user joins room, roomId is uuid, putItem.

The connectionId of the user is added to the connectionIds List in the room.

```ts
result = tbl.updateItem(
  Key={
    "pk": roomId,
    "sk": "ROOM",
  },
  UpdateExpression="SET #connectionIds = list_append(#connectionIds, :connectionId)",
  ExpressionAttributeNames={
    "#connectionIds": "connectionIds"
  },
  ExpressionAttributeValues={
    ":connectionId": [connectionId]
  },
  ReturnValues: "ALL_NEW"
)
```

#### Get

Authenticated user looks up room using roomId in getItem.

#### Leave Room

Authenticated user joins room, roomId is uuid, putItem.

The connectionId of the user is removed to the connectionIds List in the room.

```ts
// Get the room and all connectionIds
const room = tbl.getItem(
  Key={
    "pk": roomId,
    "sk": "ROOM",
  },
)
// Remove current user
const connectionIds = room.connectionIds.filter((item) => {
    return item !== event.requestContext.connectionId
})

// Set the connection Ids for the room
result = tbl.updateItem(
  Key={
    "pk": roomId,
    "sk": "ROOM",
  },
  UpdateExpression="SET #connectionIds = :connectionIds",
  ExpressionAttributeNames={
    "#connectionIds": "connectionIds"
  },
  ExpressionAttributeValues={
    ":connectionIds": connectionIds
  },
  ReturnValues: "ALL_NEW"
)
```

#### Delete

Deletes Room, Maps, Presence and Lists.

### Presence

Presence data structure is attached to a room, there can be multiple presences in a single room.

Each piece of data in the presence is homogeneous (unlike maps!!).

```json
{
  "pk": "<roomId>",
  "sk": "PRESENCE#<presenceName>",
  "data": {
    "<userId1>": {
      "x": "",
      "y": ""
    },
    "<userId2>": {
      "x": "",
      "y": ""
    }
  }
}
```

#### Create

Insert presence into table, pk is uuid as roomId, sk is `PRESENCE#<presenceName>`

#### Get

Get presence from table, pk is uuid as roomId, sk is `PRESENCE#<presenceName>`

#### Upsert

Insert presence into table, pk is uuid as roomId, sk is `PRESENCE#<presenceName>`.

Data can only be inserted for the specific user. Server side, the userID being passed in must be validated (JWT?).

Usage, updateItem:

```ts
result = tbl.updateItem(
  Key={
    "pk": roomId,
    "sk": "PRESENCE#<presenceName>",
  },
  UpdateExpression="SET data.#userId = :userData",
  ExpressionAttributeNames={
    "#userId": userId
  },
  ExpressionAttributeValues={
    ":userData": userData
  },
  ReturnValues: "ALL_NEW"
)
```

The presence object mut be passed in full? For example, we need to always pass x, y, score when updating the map? Probably, we can make that required form the type when it passed into the function.

Users would be passing in a random map, so we would be setting all the values in every insert.

#### RemoveItem

Insert presence into table, pk is uuid as roomId, sk is `PRESENCE#<presenceName>`.

user should be removed on disconnect from the room.

```ts
result = tbl.updateItem(
  Key={
    "pk": roomId,
    "sk": "PRESENCE#<presenceName>",
  },
  UpdateExpression="REMOVE data.#userId",
  ExpressionAttributeNames={
    "#userId": userId
  },
  ReturnValues: "ALL_NEW"
)
```

#### Delete

Delete presence from table, pk is uuid as roomId, sk is `PRESENCE#<presenceName>`

### Map

The map is very similar to presence, but it can have heterogeneous values.

```json
{
  "pk": "<roomId>",
  "sk": "MAP#<mapName>",
  "data": {
    "<keyName1>": {
      "x": "",
      "y": ""
    },
    "<keyName2>": {
      "parts": "",
      "stock": ""
    }
  }
}
```

#### Create

Insert map into table, pk is uuid as roomId, sk is `MAP#<mapName>`

#### Get

Get map from table, pk is uuid as roomId, sk is `MAP#<mapName>`

#### Upsert

Insert amp into table, pk is uuid as roomId, sk is `MAP#<mapName>`.

Data can only be inserted for the specific user. Server side, the userID being passed in must be validated (JWT?).

Usage, updateItem:

```ts
result = tbl.updateItem(
  Key={
    "pk": roomId,
    "sk": "MAP#<mapName>",
  },
  UpdateExpression="SET data.#keyName1 = :dataValues",
  ExpressionAttributeNames={
    "#keyName1": keyName1
  },
  ExpressionAttributeValues={
    ":dataValues": dataValues
  },
  ReturnValues: "ALL_NEW"
)
```

#### RemoveItem

Insert into table, pk is uuid as roomId, sk is `MAP#<mapName>`.

Map has to explicitly have data removed, data should be persisted inside the room.

```ts
result = tbl.updateItem(
  Key={
    "pk": roomId,
    "sk": "MAP#<mapName>",
  },
  UpdateExpression="REMOVE data.#keyName1",
  ExpressionAttributeNames={
    "#keyName1": keyName1
  },
  ReturnValues: "ALL_NEW"
)
```

#### Delete

Delete map from table, pk is uuid as roomId, sk is `MAP#<mapName>`


### List

TODO
