export enum ChatEvent {
	CONNECT = 'connection',
	DISCONNECT = 'disconnect',
	JOIN = 'join',
	MESSAGE = 'message'
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
