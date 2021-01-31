export interface UserSocket {
	socketId: string;
	username: string;
	rooms: Array<string>;
}

let users: Array<UserSocket> = [];

export function joinRoom(socketId: string, username: string, room: string) {
	console.log('ON JOIN ROOM');
	console.log(users);
	const userIndex = users.findIndex((user) => user.socketId === socketId);
	if (userIndex > 0) {
		users[userIndex].rooms.push(room);
	} else {
		users.push({ socketId, username, rooms: [ room ] });
	}
	console.log(users);
	console.log('ON JOIN ROOM END');
	return users;
}

export function disconnect(socketId: string) {
	const userIndex = users.findIndex((user) => user.socketId === socketId);
	if (userIndex >= 0) {
		const newUsers = users.splice(userIndex, 1);
		return newUsers[0];
	}
}

export function leaveRoom(room: string, username: string) {
	console.log('ON LEAVE ROOM');
	let socketIDs: Array<string> = [];
	users.forEach((user, i) => {
		if (user.username === username) {
			socketIDs.push(user.socketId);
			users[i].rooms = users[i].rooms.filter((currentRoom) => currentRoom !== room);
		}
	});
	console.log(socketIDs);
	console.log('ON LEAVE ROOM END');
	return socketIDs;
}

export function countUserSockets(username: string) {
	return users.filter((user) => user.username === username).length;
}

export function deleteRoom(room: string) {
	console.log('ON DELETE ROOM');
	let socketIDs: Array<string> = [];
	users.forEach((user, i) => {
		if (user.rooms.includes(room)) {
			socketIDs.push(user.socketId);
			users[i].rooms = users[i].rooms.filter((currentRoom) => currentRoom !== room);
		}
	});
	console.log(socketIDs);
	console.log('ON DELETE ROOM END');
	return socketIDs;
}
