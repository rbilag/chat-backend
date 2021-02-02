export enum ChatEvent {
	CONNECT = 'connection',
	DISCONNECT = 'disconnect',
	JOIN = 'join',
	MESSAGE = 'message',
	LEAVE = 'leave',
	ROOM_DELETE = 'room delete'
}
export enum MessageStatus {
	SENT = 'sent',
	DELIVERED = 'delivered',
	SEEN = 'seen',
	UNSENT = 'unsent',
	ERROR = 'error'
}

export const WELCOME_MESSAGES = [
	'{{name}} has joined the party!',
	'Welcome aboard {{name}}!',
	"It's great to have you {{name}}!",
	'Oh, hey {{name}}! Welcome!',
	'Thanks for joining us {{name}}!',
	'{{name}} in your area!'
];

export const ERROR_MESSAGES = {
	ROOM_NOT_FOUND: 'Room does not exist',
	USER_IN_ROOM: 'User already in room',
	USER_NOT_FOUND: 'User does not exist',
	NO_TOKEN: 'No access token provided',
	UNAUTHORIZED: 'Invalid credentials',
	ENDPOINT_NOT_FOUND: "API endpoint doesn't exist"
};
