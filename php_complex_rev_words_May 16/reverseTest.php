<?php declare(strict_types=1);
use PHPUnit\Framework\TestCase;

include "reverse.php";

final class ReverseTest extends TestCase
{
    public function testSimple(): void
    {
      $string = "hello work how are you";
      $reversed_string = "olleh krow woh era uoy";

      $this->assertSame($reversed_string, fast_rev($string));
    }

    public function testUppercase(): void
    {
      $string = "Cats arE aNimals";
      $reversed_string = "Stac erA sLamina";

      $this->assertSame($reversed_string, fast_rev($string));
    }

    public function testPunctuation(): void
    {
      $string = "hello, work! how's it today? for-now-good";
      $reversed_string = "olleh, krow! woh's ti yadot? rof-won-doog";

      $this->assertSame($reversed_string, fast_rev($string));
    }

    public function testUppercasePunctuation(): void
    {
      $string = "Hello, woRk! hoW's it todAy? foR-now-gooD";
      $reversed_string = "Olleh, krOw! woH's ti yadOt? roF-won-dooG";

      $this->assertSame($reversed_string, fast_rev($string));
    }

    public function testUnicode(): void
    {
      $string = "Привет, как деЛа? «Ёлочки» игОлочки и-тире";
      $reversed_string = "Тевирп, как алЕд? «Икчолё» икЧологи и-ерит";

      $this->assertSame($reversed_string, fast_rev($string));
    }
}
?>
