namespace Jarvice.CommandProcessor.Interfaces;

public interface ICommandProcessor
{
	Task ProcessCommand(string text);
}
