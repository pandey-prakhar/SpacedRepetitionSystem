package com.prakhar.revisor.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                fieldErrors.put(fe.getField(), fe.getDefaultMessage()));
        return ResponseEntity.badRequest().body(buildBody(400, "Validation Failed", fieldErrors));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadableBody(HttpMessageNotReadableException ex) {
        String message = "Malformed request body";
        if (ex.getCause() instanceof InvalidFormatException ife) {
            message = "Invalid value for field '" + lastPathRef(ife) + "': " + ife.getValue();
        }
        return ResponseEntity.badRequest().body(buildBody(400, "Bad Request", message));
    }

    @ExceptionHandler(ProblemNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ProblemNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildBody(404, "Not Found", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildBody(500, "Internal Server Error", ex.getMessage()));
    }

    private static Map<String, Object> buildBody(int status, String error, Object detail) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status);
        body.put("error", error);
        body.put(detail instanceof Map ? "errors" : "message", detail);
        return body;
    }

    private static String lastPathRef(InvalidFormatException ife) {
        if (ife.getPath() == null || ife.getPath().isEmpty()) return "?";
        return ife.getPath().get(ife.getPath().size() - 1).getFieldName();
    }
}
