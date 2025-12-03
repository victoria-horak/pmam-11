using Jarvice.SpeechService.Enums;
using Jarvice.SpeechService.Interfaces;

namespace Jarvice.SpeechService.Services;

public class SpeechService : ISpeechService
{
	private readonly IVoiceActionFactory _voiceActionFactory;

	public SpeechService(IVoiceActionFactory factory)
	{
		_voiceActionFactory = factory;
	}

	public void Speak(VoiceResponse response, string text = "")
	{
		var action = _voiceActionFactory.GetAction(response);
		action.Speak(text);
	}
}