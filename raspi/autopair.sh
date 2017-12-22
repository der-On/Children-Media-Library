#!/bin/bash
bluetoothctl << EOF
connect $BLUETOOTH_SPEAKER
EOF
