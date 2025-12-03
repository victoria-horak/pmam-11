using Jarvice.SpeechService.Enums;

namespace Jarvice.SpeechService.Interfaces;

public interface ISpeechService
{
	void Speak(VoiceResponse response, string text = "");
}
