const twilio = require("twilio");

class Twilio {
  constructor(deps) {
    const { twilio: twilioConfig } = deps.mcp.config;
    if (twilioConfig) {
      this.keys = twilioConfig;
      this.twilioClient = new twilio(
        this.keys.ACCOUNT_SID,
        this.keys.AUTH_TOKEN
      );
    }

    this.sendTwilioMessage = this.sendTwilioMessage.bind(this);
    this.sendTextForResults = this.sendTextForResults.bind(this);

    Object.assign(this, deps);
  }

  getMsgFromResults = results => {
    let messageHeader = `IN STOCK ALERT`;
    const messageBody = results.reduce((acc, result) => {
      let msgFragment = `${result.site}: ${result.text}
      ${result.url}
      
      ----------
      
      `;

      return msgFragment;
    }, "");

    const message = `
    ${messageHeader}
    ${messageBody}`;

    return message;
  };

  async sendTextForResults(results) {
    const message = this.getMsgFromResults(results);
    await this.sendTwilioMessage(message);
  }

  async sendTwilioMessage(message) {
    if (this.keys) {
      try {
        const response = await this.twilioClient.messages.create({
          body: message,
          to: this.keys.MY_PHONE_NUMBER,
          from: this.keys.TWILIO_PHONE_NUMBER
        });
        this.mcp.log(`Text successfully sent, SID: ${response.sid}`);
      } catch (e) {
        this.mcp.addGenericError("Error sending text");
      }
    } else {
      this.mcp.addConfigError("Missing Twilio config keys");
    }
  }
}

module.exports = Twilio;
