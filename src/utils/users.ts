type UserSocket = {
	socketId: string;
	username: string;
	room: string;
};

let users: Array<UserSocket> = [];

export function joinRoom(socketId: string, username: string, room: string) {
	return users.push({ socketId, username, room });
}

export function disconnect(socketId: string) {
	const index = users.findIndex((user) => user.socketId === socketId);
	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
}

export function getUser(socketId: string) {
	return users.find((user) => user.socketId === socketId);
}

export function getRoomUsers(room: string) {
	return users.filter((user) => user.room === room);
}
