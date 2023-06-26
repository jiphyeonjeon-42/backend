#!/bin/sh

ls dev*.log | rargs deno task report {0} > report.md
