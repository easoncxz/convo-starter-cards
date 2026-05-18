terraform {
  required_providers {
    netlify = {
      source  = "netlify/netlify"
      version = "~> 0.1"
    }
  }
}

provider "netlify" {
  # Reads NETLIFY_TOKEN from environment
}

resource "netlify_site" "main" {
  name = "convo-starter-cards"
}

output "site_id" {
  value = netlify_site.main.id
}

output "site_url" {
  value = "https://convo-starter-cards.netlify.app"
}
