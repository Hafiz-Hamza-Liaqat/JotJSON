export const SAMPLE_JSON = `{
  "profile": {
    "display.name": "Casey Morgan",
    "email": "casey.morgan@example.test",
    "roles": ["editor", "reviewer"],
    "active": true,
    "lastLogin": null
  },
  "account": {
    "plan": "team",
    "seats": 12,
    "billingId": 9007199254740993,
    "renewalRate": 1.5e2
  },
  "settings": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "sms": false,
      "digest": "weekly"
    },
    "privacy note": "Processed locally"
  },
  "flags": {
    "betaSearch": true,
    "legacyCompare": false
  },
  "inventory": [
    {
      "sku": "jot-101",
      "name": "Notebook (graph)",
      "price": 12.5,
      "tags": ["paper", "grid"]
    },
    {
      "sku": "jot-204",
      "name": "Ink refill \\"blue\\"",
      "price": 4.0,
      "tags": ["ink"]
    }
  ]
}`;

export const SAMPLE_COMPARE_ORIGINAL = `{
  "user": {
    "name": "Alex",
    "active": true
  },
  "items": [1, 2, 3]
}`;

export const SAMPLE_COMPARE_MODIFIED = `{
  "user": {
    "name": "Alexandra",
    "active": true,
    "role": "admin"
  },
  "items": [1, 3]
}`;
