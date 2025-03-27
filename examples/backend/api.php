<?php

$json = file_get_contents('php://input');
$data = json_decode($json, true);
file_put_contents('data.json', json_encode($data, JSON_PRETTY_PRINT));

print_r($data);