import AWS from 'aws-sdk';

export class DNSService {
  constructor() {
    this.route53 = new AWS.Route53({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.hostedZoneId = process.env.AWS_HOSTED_ZONE_ID;
    this.domain = 'dockersphere.ovh';
  }

  async createRecord(subdomain) {
    const params = {
      HostedZoneId: this.hostedZoneId,
      ChangeBatch: {
        Changes: [{
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: `${subdomain}.${this.domain}`,
            Type: 'A',
            TTL: 300,
            ResourceRecords: [{ Value: process.env.SERVER_IP }]
          }
        }]
      }
    };

    await this.route53.changeResourceRecordSets(params).promise();
  }

  async removeRecord(subdomain) {
    const params = {
      HostedZoneId: this.hostedZoneId,
      ChangeBatch: {
        Changes: [{
          Action: 'DELETE',
          ResourceRecordSet: {
            Name: `${subdomain}.${this.domain}`,
            Type: 'A',
            TTL: 300,
            ResourceRecords: [{ Value: process.env.SERVER_IP }]
          }
        }]
      }
    };

    try {
      await this.route53.changeResourceRecordSets(params).promise();
    } catch (error) {
      if (error.code !== 'InvalidChangeBatch') throw error;
    }
  }
}