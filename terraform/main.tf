terraform {
  required_providers {
    netlify = {
      source  = "netlify/netlify"
      version = "~> 0.4"
    }
  }
}

provider "netlify" {
  # Set NETLIFY_TOKEN environment variable
}

resource "netlify_site" "main" {
  name         = "convo-starter-cards"
  account_slug = "easoncxz"
}

output "site_id" {
  value = netlify_site.main.id
}

output "site_url" {
  value = "https://convo-starter-cards.netlify.app"
}

# To import the existing site:
#   cd terraform
#   export NETLIFY_TOKEN=<your-token>
#   tofu init
#   tofu import netlify_site.main 1d06fa63-f967-42d3-8029-1c9493404eb4
#   tofu plan
