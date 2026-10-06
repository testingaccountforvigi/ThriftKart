# ThriftKart — SEPM Assessment Pack

This folder contains the polished frontend prototype for the ThriftKart case study plus the requirement/design artefacts that keep the implementation aligned.

## Website
Open `website/index.html` directly in a modern browser, or serve the folder with a simple local server.

The prototype includes:
- sticky translucent navigation and smooth scrolling
- animated reveal sections and hover states
- responsive marketplace cards
- search, condition filter and price sort
- listing details modal
- lightweight “message seller” and purchase-request interactions
- sell-a-book form with validation
- browser `localStorage` keeps submitted listings as Pending Moderation without exposing them in the public marketplace
- campus-first handover language and moderation-first trust model

No build step is required.

## Suggested local run

```bash
cd website
python3 -m http.server 5500
```

Then open `http://localhost:5500`.

## Included project files
- `ThriftKart_BRD.docx` — business requirements baseline
- `ThriftKart_SRS.docx` — IEEE 830-style software requirements baseline
- `ThriftKart_Project_Master.docx` — complete project blueprint and viva-ready summary
- `ThriftKart_UML_Package.docx` — exact diagram blueprint and consistency notes
- `ThriftKart_UML.puml` — PlantUML source for use case, class, sequence, activity and state diagrams
- `ThriftKart_schema.sql` — proposed relational schema
- `website/` — frontend prototype

## Key design decision
The MVP uses a lightweight chat plus transaction payment status/confirmation. A full payment gateway is deferred, while campus handover remains the primary fulfillment mechanism.

## Important academic note
The case study provides the quantitative estimates; the database schema, price boundary and UI details in this pack are proposed design decisions so the implementation is concrete. They are not presented as case-provided facts.
