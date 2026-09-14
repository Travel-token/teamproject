import com.teamproject.travelsettle.capture.PaymentMessageParser;
import java.util.Objects;

public class PaymentMessageParserTest {
    private static void check(String text, Long expected) {
        if (!Objects.equals(expected, PaymentMessageParser.extract(text)))
            throw new AssertionError("Unexpected parsed amount");
    }

    public static void main(String[] args) {
        check("카드 승인\n12,000원\n테스트상점", 12000L);
        check("카드 승인\n1500원\n잔액 30,000원", 1500L);
        check("카드 결제\n1,000원\n누적 30,000원", 1000L);
        check("승인 취소 12,000원", null);
        check("결제 예정 12,000원", null);
        check("결제 인증번호 123456 12,000원", null);
        check("결제 OTP 1234", null);
        check("친구가 12,000원 보냈어요", null);
        check("승인 12000원 30000원", null);
        check("결제 USD 20 원화 30000원", null);
        check("승인 1000000001원", null);
        check("승인 999999999999999999999999999999원", null);
        check("승인 1.23원", null);
        check("결제 잔액 30,000원", null);
        check("승인 0원", null);
        System.out.println("PaymentMessageParser: 15 cases passed");
    }
}