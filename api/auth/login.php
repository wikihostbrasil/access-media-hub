<?php
include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../config/jwt.php';

$database = new Database();
$db = $database->getConnection();
$jwt = new JWTHandler();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(array("error" => "Email e senha são obrigatórios"));
        exit();
    }

    $email = $data['email'];
    $password = $data['password'];

    try {
        $query = "SELECT p.*, u.email, u.password_hash FROM profiles p 
                  JOIN users u ON p.user_id = u.id 
                  WHERE u.email = :email AND p.active = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($password, $user['password_hash'])) {
                $token = $jwt->createToken($user['user_id'], $user['email'], $user['role']);
                
                http_response_code(200);
                echo json_encode(array(
                    "user" => array(
                        "id" => $user['user_id'],
                        "email" => $user['email'],
                        "full_name" => $user['full_name'],
                        "role" => $user['role']
                    ),
                    "access_token" => $token
                ));
            } else {
                http_response_code(401);
                echo json_encode(array("error" => "Credenciais inválidas"));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("error" => "Usuário não encontrado ou inativo"));
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Erro interno do servidor"));
    }
} else {
    http_response_code(405);
    echo json_encode(array("error" => "Método não permitido"));
}
?>