package com.example.back.controller;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.*;
import org.springframework.jdbc.core.JdbcTemplate;
import com.example.back.service.TripAccess;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class IntegrationControllerTest {
    HttpServer server;
    IntegrationController controller;
    MockMultipartFile image;
    AtomicReference<String> request = new AtomicReference<>();

    @BeforeEach void setup() throws Exception {
        controller = new IntegrationController(mock(JdbcTemplate.class), mock(TripAccess.class));
        ReflectionTestUtils.setField(controller, "ocrKey", "");
        var bytes = new ByteArrayOutputStream();
        javax.imageio.ImageIO.write(new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB), "png", bytes);
        image = new MockMultipartFile("file", "receipt.png", "image/png", bytes.toByteArray());
    }
    void upstream(int status, String json) throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/ocr", exchange -> {
            request.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.ISO_8859_1));
            byte[] response = json.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();
        ReflectionTestUtils.setField(controller, "ocrUrl", "http://127.0.0.1:" + server.getAddress().getPort() + "/ocr");
    }
    @AfterEach void cleanup() { if (server != null) server.stop(0); }

    @Test void acceptsPythonResponseAndSendsImagePart() throws Exception {
        upstream(200, "{\"name\":\"Cafe\",\"amount\":5000,\"spentAt\":\"2024-02-29 14:30:00\",\"categoryCode\":\"cafe\",\"confidence\":{\"name\":0.8,\"amount\":0.9,\"spent_at\":0.9,\"category_code\":0.7}}");
        var result = controller.parse(1L, image);
        assertEquals("2024-02-29T14:30:00", result.spentAt());
        assertEquals(0.8, result.confidence().get("name"));
        assertTrue(request.get().contains("name=\"image\""));
        assertFalse(request.get().contains("name=\"file\""));
    }
    @Test void partialRecognitionRemainsEditable() throws Exception {
        upstream(200, "{\"name\":null,\"amount\":5000,\"spentAt\":null,\"categoryCode\":null,\"confidence\":{}}");
        assertNull(controller.parse(1L, image).name());
    }
    @Test void invalidUpstreamDateBecomesBadGateway() throws Exception {
        upstream(200, "{\"name\":\"Cafe\",\"amount\":5000,\"spentAt\":\"2026-02-30 14:30:00\",\"confidence\":{}}");
        assertEquals(502, assertThrows(ResponseStatusException.class, () -> controller.parse(1L, image)).getStatusCode().value());
    }
    @Test void upstreamValidationFailureBecomesBadGateway() throws Exception {
        upstream(422, "{\"detail\":\"missing image\"}");
        assertEquals(502, assertThrows(ResponseStatusException.class, () -> controller.parse(1L, image)).getStatusCode().value());
    }
    @Test void missingOrMalformedUrlIsAConfigurationError() {
        for (String url : new String[]{"", "not a URI", "file:///tmp/ocr", "/ocr"}) {
            ReflectionTestUtils.setField(controller, "ocrUrl", url);
            assertEquals(503, assertThrows(ResponseStatusException.class, () -> controller.parse(1L, image)).getStatusCode().value());
        }
    }
}
