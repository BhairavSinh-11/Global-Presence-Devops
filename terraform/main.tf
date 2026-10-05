terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"

}

resource "aws_instance" "my_instance" {
  ami           = "ami-01a00762f46d584a1"
  instance_type = "c7i-flex.large"

  tags = {
    Name = "MynewInstance"
  }
}   