terraform {
  backend "s3" {
    bucket       = "taskapi-dev-tfstate-090413359912"
    key          = "taskapi/dev/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}