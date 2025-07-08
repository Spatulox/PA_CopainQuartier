#!/bin/bash
go build -o updater updater.go
cp updater ../JavaApp/bin
