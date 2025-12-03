using Jarvice.SpeechService.Interfaces;
using System.Speech.Synthesis;

namespace Jarvice.SpeechService.Actions;

public class TtsAction : IVoiceAction
{
	private readonly SpeechSynthesizer _synthesizer;

	public TtsAction(SpeechSynthesizer synthesizer)
	{
		_synthesizer = synthesizer;
	}

	public void Speak(string text)
	{
		_synthesizer.SpeakAsync(text);
	}
}
