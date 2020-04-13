const ServerStatus = {
  running: 0,
  stopped: 1,

  description: status => {
    switch (status) {
      case ServerStatus.running:
        return "Running";
      case ServerStatus.stopped:
        return "Stopped";
    }
  }
};

module.exports = { ServerStatus };
