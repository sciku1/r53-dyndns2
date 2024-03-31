# DynDNS2 AWS Lambda + Route 53

Simple (and a little naive) implementation of dyndns2 protocol using AWS Lambda + Route 53

## Purpose

This is a simple implementation of dyndns2 protocol using AWS Lambda + Route 53, deployed using SST. It's very basic, but if you own a domain name and are using a dns provider that does not support dyndns2 protocol or [previously supported and does not anymore](https://support.squarespace.com/hc/en-us/articles/17131164996365-About-the-Google-Domains-migration-to-Squarespace#toc-does-squarespace-support-dynamic-dns--ddns--) this can be a good option. In theory, this should work with any client that supports dyndns2. If not, please file an issue.

### Requirements

- NodeJS 18
- [SST Ion CLI](https://ion.sst.dev/)
- An AWS Account set up locally
- A hosted zone setup for your domain

### Deployment

To deploy this project, you will need to have the [SST CLI](https://ion.sst.dev/) installed. Point your previous DNS Provider to the your hosted zone name servers.

Copy the .env.example and rename it to `.env.local`, make sure to fill out all the values:

```
sst deploy --stage production
```

This will build and deploy the lambda. If you're using DDClient, you can use the output in this way:

```

protocol=dyndns2
use=web, web=https://ipv4.icanhazip.com, web-skip='\\n\\n' # Or your choice of ip provider service
server=<Your API Gateway instance, as should be output from the SST command>
ssl=yes
daemon=300
login=<Your username defined in .env.local>
password=<Your password defined in .env.local>
subdomain.example.com
```

### Contributing

Follow the guide for setting up the SST Ion, then run:

```
sst dev
```

Pull requests are welcome!
