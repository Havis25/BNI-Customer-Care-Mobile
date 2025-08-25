// SERVER SOCKET EVENTS FOR BNI B-CARE
// Deploy this to https://bcare.my.id server

// Audio Call Events
socket.on('audio:invite', (data) => {
  console.log('Audio call invite:', data);
  socket.to(data.room).emit('call:ringing', { 
    type: 'audio',
    from: socket.userId,
    room: data.room 
  });
});

socket.on('audio:accept', (data) => {
  console.log('Audio call accepted:', data);
  socket.to(data.room).emit('audio:accepted', { 
    from: socket.userId,
    room: data.room 
  });
});

socket.on('audio:decline', (data) => {
  console.log('Audio call declined:', data);
  socket.to(data.room).emit('call:declined', { 
    type: 'audio',
    from: socket.userId,
    room: data.room 
  });
});

socket.on('audio:hangup', (data) => {
  console.log('Audio call hangup:', data);
  socket.to(data.room).emit('call:ended', { 
    type: 'audio',
    from: socket.userId,
    room: data.room 
  });
});

socket.on('audio:data', (data) => {
  // Forward audio data to other peers in room
  socket.to(data.room).emit('audio:data', {
    ...data,
    from: socket.userId
  });
});

// Video Call Events (existing + streaming)
socket.on('call:invite', (data) => {
  console.log('Video call invite:', data);
  socket.to(data.room).emit('call:ringing', { 
    type: 'video',
    from: socket.userId,
    room: data.room 
  });
});

socket.on('call:accept', (data) => {
  console.log('Video call accepted:', data);
  socket.to(data.room).emit('call:accepted', { 
    from: socket.userId,
    room: data.room 
  });
});

socket.on('call:decline', (data) => {
  console.log('Video call declined:', data);
  socket.to(data.room).emit('call:declined', { 
    type: 'video',
    from: socket.userId,
    room: data.room 
  });
});

socket.on('call:hangup', (data) => {
  console.log('Video call hangup:', data);
  socket.to(data.room).emit('call:ended', { 
    type: 'video',
    from: socket.userId,
    room: data.room 
  });
});

socket.on('call:stream', (data) => {
  // Forward video stream data to other peers
  socket.to(data.room).emit('call:stream', {
    ...data,
    from: socket.userId
  });
});

// Ticket Context Events
socket.on('ticket:context', (data) => {
  console.log('Ticket context shared:', data);
  socket.to(data.room).emit('ticket:context', {
    ...data,
    from: socket.userId
  });
});