module.exports = {
  apps: [
    {
      name: "client",
      cwd: "./client",
      script: "npm",
      args: "start"
    },
    {
      name: "server",
      cwd: "./server",
      script: "npm",
      args: "start"
    },
    {
      name: "flask-server",
      cwd: "./flask-server",
      script: "python",
      args: "server.py"
    }
  ]
};

