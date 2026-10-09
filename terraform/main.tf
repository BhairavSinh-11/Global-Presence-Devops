terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket       = "global-presence-tfstate-2423"
    key          = "production/terraform.tfstate"
    region       = var.region
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.region

}

resource "aws_instance" "my_instance" {
  ami           = var.instance_ami
  instance_type = var.instance_type

  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  key_name               = var.key_name
  tags = {
    Name = "Global Presence"
  }
}

resource "aws_security_group" "ec2_sg" {
  name        = "launch-wizard-3"
  description = "launch-wizard-3 created 2026-09-03T06:34:46.875Z"


  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "GP SG"
  }

}

resource "aws_eip" "my_eip" {
  domain = "vpc"
  tags = {
    Name = "GP IP"
  }

}

resource "aws_eip_association" "eip_assoc" {
  instance_id   = aws_instance.my_instance.id
  allocation_id = aws_eip.my_eip.id
}