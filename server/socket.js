export default (socket = io => {
  io.on("connection", function(socket) {
    console.log("socket connected");
  });
});
